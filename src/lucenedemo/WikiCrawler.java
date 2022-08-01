package lucenedemo;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;


/**
 * Crawls a wikipedia page and generates a graph starting at user input starting page and 
 * only including pages with user input keywords.  The graph will be recorded as the number
 * of edges followed by a list of edges in the textfile.  Each line represents an edge and each
 * edge is a space separated pair of vertex names.  
 * 
 * Pages will be crawled and collect until the maximum number of pages are collected where the maximum
 * is user specificed.  Once this limit has been reached, edges in the graph will continue to be generated
 * but only between previously recorded vertices.  Any URLs to previously unseen pages will be ignored 
 * once the max page limit has been reached.  
 * 
 * The above insures a hard upper limit on the number of vertices and prevents the situation where
 * there are edges to new pages that were not completely crawled.
 * @author Alex Shum
 */
public class WikiCrawler {
	private static final String BASE_URL = "https://en.wikipedia.org";
	private LinkedList<String> toVisit; //link queue
	private Set<String> visitedURL; //visited URL that does not contain search terms
	private Set<String> visitedUsefulURL; //visited URL that contains search terms
	private List<String> edges;
	private List<String> edgeTool;
	private int KeyId = 0; // Auto increment of Key Id will be used in the JSON file 
	private String seedURL; //start url
	private String[] keywords; //search words
	private int max; //max number of pages
	private int numCrawled; //number of pages that contain search words
	private int pagesRequested;
	private String fileName; 
	public Map<String, String> map = new HashMap<String, String>();
	
	
	// seed url is glasgow , 1000 nodes , 
	public WikiCrawler(String seedURL, int max, String fileName) {
		toVisit = new LinkedList<String>();
		visitedURL = new HashSet<String>();
		visitedUsefulURL = new HashSet<String>();
		edges = new LinkedList<String>();
		
		this.seedURL = seedURL;
		this.max = max;
		this.fileName = fileName;
		numCrawled = 0;
		pagesRequested = 0;
		map.put(BASE_URL+seedURL, "0"); 
	}
	
	/**
	 * Starts the wikipedia page crawling process starting from the seedURL.
	 * @throws InterruptedException if Thread.sleep has any issues.
	 * @throws IOException 
	 */
	public void crawl() throws InterruptedException, IOException {
		//check if seed URL contains your search terms
		SimpleWikiContentParser c = new SimpleWikiContentParser(BASE_URL + seedURL);

		pagesRequested++;
		numCrawled++;
		// pass seedURL toVisit array 
		toVisit.add(seedURL);
		visitedUsefulURL.add(seedURL);

		//begin crawl
		boolean keepCrawling = true;
		while(keepCrawling) {
			keepCrawling = crawlNext();
		}
	
	}
	
	/**
	 * Crawls the next page in the queue.  Collects new links until max limit reached; afterwards
	 * this will continue to add edges to the graph only between previously seen vertices.
	 * 
	 * This function will automatically wait 2 seconds every 200 page requests.
	 * 
	 * @warning Error handling is handled by SimpleWikiLinkParser and SimpleWikiContentParser.
	 * 			Any issues with bad links or connectivity will result in trying the next available URL.
	 * 
	 * @return true if there are any links left to crawl in the queue.  false otherwise.
	 * @throws InterruptedException if Thread.sleep has any issues.
	 */
	public boolean crawlNext() throws InterruptedException, IOException {
		if(toVisit.isEmpty()) return(false);
		String fromPage = toVisit.poll();
		System.out.println(fromPage);
		
		SimpleWikiLinkParser s = new SimpleWikiLinkParser(BASE_URL + fromPage);
		Set<String> newLinks = s.getLinks();
		//System.out.println("edges tool : "+ newLinks);
		pagesRequested++;
		
		SimpleWikiContentParser c;
		
		for(String l : newLinks) {	
			//TODO
			if(visitedUsefulURL.contains(l) && !fromPage.equalsIgnoreCase(l)) { //previously seen this page and it has keyword matches
				edges.add(map.get(BASE_URL +fromPage) + fromPage + " " + map.get(BASE_URL +l)+ l);
			} else if(visitedURL.contains(l) || fromPage.equalsIgnoreCase(l)) { //previously seen this page, no keyword matches
				//do nothing
			} else if(numCrawled < max) { //new unseen page and still need to crawl more pages
				c = new SimpleWikiContentParser(BASE_URL + l);
				if(pagesRequested % 200 == 0) Thread.sleep(2000);
				pagesRequested++;
				
				String url = BASE_URL + l ; 
				try {
					Connection con = Jsoup.connect(url);
					Document doc = con.get();
					if (con.response().statusCode() == 200) {
						
						String title = doc.title();
						String content = doc.select("p").text();
						System.out.println(title);
						System.out.println(content);
						KeyId += 1;

						JSONObject main = new JSONObject();
						main.put("KeyID", String.valueOf(KeyId));
						main.put("URL", url);
						main.put("Title", title);
						main.put("Content: ", content);
						
						map.put(url,String.valueOf(KeyId));
						
						System.out.println("URL CHECK = " + url);
						System.out.println("MAP2 CHECK = " + map);	
						
						try {
					         FileWriter file = new FileWriter("Jsonfile/" + map.get(url) + ".json");
					         file.write(main.toString());
					         file.close();
					      } catch (IOException e) {
					         e.printStackTrace();
					      }	
					}
				} catch (IOException e) {
					e.printStackTrace();
				}
				
				if(c.pageContainsAllTerms()==false) {
					toVisit.add(l);	
					edges.add(map.get(BASE_URL +fromPage) + fromPage + " " + map.get(BASE_URL +l)+ l);
					visitedUsefulURL.add(l);
					numCrawled++;
				} else {
					visitedURL.add(l);
				}
				writeTolink(fromPage);
			} else { //done getting new pages
				//do nothing
			}
		}
		edges.clear();
		return(true);		
	}

	private void writeTolink(String UrlFrom) throws IOException {
		
		String fromPage = map.get(BASE_URL + UrlFrom);
		FileWriter fw = new FileWriter("pr_data/"+ fromPage + "_links.txt");
		for(String s : edges) {
			fw.write(s + System.lineSeparator());
		}
		fw.close();		
	}
	// Start 
	 public static void main(String[] args) throws InterruptedException, FileNotFoundException, IOException {
		 
		 int max_nodes = 20000;
		 String outputFileName = "links.txt";
		 WikiCrawler w = new WikiCrawler("/wiki/Main_Page",  max_nodes, outputFileName);
		 w.crawl();
	
	 }
}