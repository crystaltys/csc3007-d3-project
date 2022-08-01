package lucenedemo;

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexableField;
import org.apache.lucene.index.LeafReader;
import org.apache.lucene.index.LeafReaderContext;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.DocIdSetIterator;
import org.apache.lucene.search.Explanation;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.ScoreMode;
import org.apache.lucene.search.Scorer;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.search.Weight;
import org.apache.lucene.store.FSDirectory;



/** Simple command-line based search demo. */
public class SearchFiles {
	
  public static double totalHits;
  public static String subQuery ;
  public SearchFiles(String query) {
	  this.subQuery = query; 
  }
  
  public List<Entry<Integer, Double>> search_results() throws ParseException, IOException{

	    String index = "index";
	    String field = "contents";
	    String queries = null;
	    int repeat = 0;
	    boolean raw = false;
	    String queryString = null;
	    int hitsPerPage = 10;
	    List<String> edges = new LinkedList<String>();
	    List<Double> pg_rank = new LinkedList<Double>();
	    List<Double> ls_rank = new LinkedList<Double>();
	    List<Double> total_rank = new LinkedList<Double>();
	    Map<Integer, Double> sorted_rank = new HashMap<Integer, Double>();

	    
	    // Boilerplate code:
	    // IndexReader - Access to lucene data structures
	    // IndexSearch - Use index searcher to perform search
	    IndexReader reader = DirectoryReader.open(FSDirectory.open(Paths.get(index)));
	    System.out.print(reader.numDocs());
	    IndexSearcher searcher = new IndexSearcher(reader);
	    Analyzer analyzer = new StandardAnalyzer();
	    
	    QueryParser parser = new QueryParser(field, analyzer);
	    String line = subQuery;
	    line = line.trim();
	    Query query = parser.parse(line);
	    

	    // get lucene score
	    System.out.println("Searching for: " + query.toString(field));
	    // ensure that no results are ommited from the search 
	    TopDocs results = searcher.search(query, reader.numDocs());
	    ScoreDoc[] hits = results.scoreDocs;
	  
		ArrayList<Integer> matchingDocs = new ArrayList<Integer>();
		// Get cosine similarity score here
		  for(int i=0;i<hits.length;++i){
			  matchingDocs.add(hits[i].doc);
			  Double d = (double) hits[i].score;
			  ls_rank.add(d);
		  }
	      
	  // get custom score
	  // extract all matchingDocs into another textfile
	  System.out.println(matchingDocs);
	  List<Integer> newList = new ArrayList<>(matchingDocs);
	  newList.removeIf(i -> i > new File("pr_data/").list().length);

	  List<Integer> count = new ArrayList<Integer>();
	  HashSet<Integer> hashSet = new HashSet();
	  for(int i=0;i<newList.size();++i){
		  System.out.println("i : " + i);
		  String filePath = "pr_data/"+i+"_links.txt";
		  HashSet<Integer> a = new HashSet<Integer>();
	      String line1;
	      System.out.println("filePath : " + filePath);
	      BufferedReader reader1 = new BufferedReader(new FileReader(filePath));
	      while ((line1 = reader1.readLine()) != null)
	      {
	          String[] parts = line1.split(" ", 2);
	          if (parts.length >= 2)
	          {
	        	String Vname0=  String.valueOf(parts[0]);
	        	String Vname1=  String.valueOf(parts[1]);
	 
	        	String newVname0 = Vname0.replaceFirst("/.*", "");
	        	String newVname1 = Vname1.replaceFirst("/.*", "");
	        	if (newVname1.equals("null") || newVname0.equals("null")) {
	        		continue;
	        	}
	        	
	        	int docId1 = Integer.parseInt(String.valueOf(newVname0));
	        	int docId2 = Integer.parseInt(String.valueOf(newVname1));
	        	//System.out.println("docId1 : "+docId1);
	        	//System.out.println("docId2 : "+docId2);

	        	boolean test= newList.contains(docId1);
	        	boolean test1= newList.contains(docId2);
	        	
	        	//System.out.println("parts[0] : "+parts[0]);
	        	//System.out.println("parts[1] : "+parts[1]);
	        	//System.out.println("test[0] : "+test);
	        	//System.out.println("test[1] : "+test1);
	        	if (test || test1) {
	        		edges.add(docId1 + " " + docId2);
	        		count.add(docId1);
	        		count.add(docId2);
	        	}
	         
	          }
	          hashSet.addAll(count);
	          //System.out.println(hashSet.size());
	      }

	  }
	  	FileWriter fw = new FileWriter("filtered.txt");
		BufferedWriter bw = new BufferedWriter(fw);
		bw.write(hashSet.size() + System.lineSeparator());
		for(String s : edges) {
			bw.write(s + System.lineSeparator());//add encoder here
		}
		bw.close();
	  // OUTPUT IS ALL LINES INTO A FILE CALLED "FILTERED"
	  
	  double eps = 0.05; //pagerank convergence criteria
	  PageRanking p = new PageRanking("filtered.txt",eps);
	  //String[] top100 = p.topKPageRank(10); //top 100 page rank
	   Map<String, Double> result = p.calcPageRank();
	   System.out.println(result.size());
	   for(int i : matchingDocs){
		   String j = String.valueOf(i);
		   pg_rank.add(result.get(j));
	   }
	   
	   // start ranking all
	   System.out.println("check");
	   System.out.println(matchingDocs.size());
	   //System.out.println(ls_rank.get(258));
	   //System.out.println(pg_rank.get(258));
	   for(int i=0; i<matchingDocs.size(); i++){
		   Double val = pg_rank.get(i);
		   if (val==null) {
			   val = 0.01;
		   }
		   Double total = (2.0*(ls_rank.get(i)*val)) /(ls_rank.get(i)+val);
		   System.out.println(total);
		   total_rank.add(total);
		   sorted_rank.put(matchingDocs.get(i), total);
	   }
	   List<Entry<Integer, Double>> list = new LinkedList<Entry<Integer, Double>>(sorted_rank.entrySet()); 
	   Collections.sort(list, (o1, o2) -> o1.getValue().compareTo(o2.getValue()));
	   
	   
	   reader.close();
	   return list;
	

  }
 

  /** Simple command-line based search demo. */
  public static void main(String[] args) throws Exception {
  }

    public static class CustomScoreQuery extends Query {
	  
	    private Query subQuery;
	    private ArrayList<Integer> m_docs;
	    
	    public CustomScoreQuery(Query query, ArrayList<Integer> docs) {
	    	subQuery = query;
	    	m_docs = docs;
	    }

		public Weight createWeight(IndexSearcher searcher, ScoreMode needsScores, float boost) throws IOException {
			// calling our own implementation of weights
			// Boost values that are less than one will give less importance to this query compared to other ones while values 
			// that are greater than one will give more importance to the scores returned by this query.
			// The complete mode lets produced scorers to visiting all matches and get their score.
			// Produced scorers will optionally allow skipping over non-competitive hits using the Scorable.setMinCompetitiveScore(float) API
			// Can set to COMPLETE OR TOP_SCORES
			needsScores = ScoreMode.COMPLETE;
			boost = 1.0f; 
			return new CustomWeights(searcher,needsScores,boost);
		}
		
		@Override
		//// you can pass anything into this function to check if the query is equals to the word
		public boolean equals(Object other) {
			return true;
		}

		@Override
		// useless code
		public int hashCode() {
			return classHash() + subQuery.hashCode();
		}


		@Override
		public String toString(String field) {
			return "The Query is: " + field.toString();
		}
		
	   //=========================== W E I G H T ============================
		   
	   //The Weight interface provides an internal representation of the Query
		  /**
		   * The Weight interface has these important methods:
		   * 1. explain(context, int doc) - This provides an explanation of the score computation for the named doc
		   * 
		   */
		public class CustomWeights extends Weight {
		   Weight forwardsWeight = null;
	     
		   protected CustomWeights(IndexSearcher searcher, ScoreMode scoremode, float bootsval) throws IOException {
				super(CustomScoreQuery.this);
				forwardsWeight = subQuery.createWeight(searcher, scoremode, bootsval);
		   }
		   
		   @Override
		   public boolean isCacheable(LeafReaderContext arg0) {
				return false;
			}
	
		   @Override
		   public Explanation explain(LeafReaderContext context, int doc) throws IOException {
			    // calls the scoring class to perform scoring 
			    BackwardsScorer scorer = _scorer(context);
				scorer.iterator().advance(doc);
				return scorer.explain();
			}
	
			@SuppressWarnings("deprecation")
			public void extractTerms(Set<Term> terms) {
				forwardsWeight.extractTerms(terms);
				
			}
			public BackwardsScorer _scorer(LeafReaderContext context) throws IOException {
				DocIdSetIterator fwdIter = DocIdSetIterator.empty();
	            Scorer forwardsScorer = forwardsWeight.scorer(context);
	            if (forwardsScorer != null) {
	                fwdIter = forwardsScorer.iterator();
	            }
	            return new BackwardsScorer(this, context, fwdIter);

	        }
			
			@Override
			public Scorer scorer(LeafReaderContext context) throws IOException {
			    return this._scorer(context);
			}	
	 
	   }
	   
	 //=========================== S C O R E ============================
	   
	   public class BackwardsScorer extends Scorer {
		   
		   final float FORWARDS_SCORE = 5.0f;
		   float currScore = 0.0f;
	       DocIdSetIterator forwardIterator = null;
	       DocIdSetIterator iter = null;

		   protected BackwardsScorer(Weight weight, LeafReaderContext context, DocIdSetIterator forwardsIter) throws IOException {
				super(weight);
				forwardIterator = forwardsIter;
			}
		   
		   public Explanation explain() {
			   // this loops through all the docs to find the matching doc to retrieve the explation
	            if (docID() == forwardIterator.docID()) {
	                return Explanation.match(FORWARDS_SCORE, "Forward term match " + this.getWeight().getQuery());
	            }
	            return null;
	        }
		   
		    @Override
			public float score() throws IOException {
			    // we have the doc id of all the matching page number, now we have to do ranking

	            return 0.0f;
			}
		   
		   public DocIdSetIterator iterator() {
			    iter = new Iterator(forwardIterator);
			    return iter;
	        }

			@Override
			public int docID() {
				return iter.docID();
			}

			@Override
			public float getMaxScore(int arg0) throws IOException {
				return 0;
			}
	
		
	   } 
	   
	   public class Iterator extends DocIdSetIterator {

	        private DocIdSetIterator forwardIterator;

		    Iterator(DocIdSetIterator fwdIter) {
		        forwardIterator = fwdIter;
	        }

	        @Override
	        public int docID() {
	            int forwardsDocId = forwardIterator.docID();
	            if (forwardsDocId != NO_MORE_DOCS) {
	                return forwardsDocId;
	            }
	            return NO_MORE_DOCS;
	        }

	        @Override
	        public int nextDoc() throws IOException {
	            int currDocId = docID();
	            // increment one or both
	            if (currDocId == forwardIterator.docID()) {
	                forwardIterator.nextDoc();
	            }
	            return docID();
	        }


	        @Override
	        public int advance(int target) throws IOException {
	            forwardIterator.advance(target);
	            return docID();                }

	        @Override
	        public long cost() {
	            return 1;
	        }

	    }
	
  }
  
}



