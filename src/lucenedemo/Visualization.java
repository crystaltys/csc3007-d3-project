package lucenedemo;

import java.awt.BorderLayout;
import java.awt.EventQueue;
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.net.*;


import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.border.EmptyBorder;
import javax.swing.JLabel;
import java.awt.Font;
import javax.swing.JTextField;
import java.awt.Point;
import java.awt.Color;
import java.awt.ComponentOrientation;
import javax.swing.JButton;
import javax.swing.UIManager;
import javax.swing.border.LineBorder;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import lucenedemo.PageRanking;
import lucenedemo.WikiCrawler;

import javax.swing.JTextPane;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.swing.ImageIcon;
import java.awt.SystemColor;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.util.ArrayList;

public class Visualization extends JFrame {

	private JTextField txtSearch;

	private static String firstlink = "";
	private static String secondlink = "";
	private static String thirdlink = "";
	private static String fourlink = "";
	private static String fivelink = "";
	private static String sixlink = "";
	private static String sevenlink = "";
	private static String eightlink = "";
	private static String ninelink = "";
	private static String tenlink = "";
	
	
	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			public void run() {
				
				//The try and catch to run the Java Frame
				try {
					Visualization frame = new Visualization();
					
					//To make the Frame Visible
					frame.setVisible(true);
				} 
				
				catch (Exception e) {
					//Print error if frame not initalized
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the frame.
	 */
	
	public Visualization() {
		
		//Start of the main screen
		getContentPane().setComponentOrientation(ComponentOrientation.LEFT_TO_RIGHT);
		getContentPane().setBackground(Color.WHITE);
		
		//Top bar name
		setTitle("CSC3");
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		
		//Set the bounds of screen
		setBounds(100, 100, 719, 727);
		getContentPane().setLayout(null);
		getContentPane().setLayout(null);
		
		int x = 90;
		int _x= 25;
		//Label to contain text for link 1
		JLabel lblNewLabelCount = new JLabel("");
		lblNewLabelCount.setForeground(SystemColor.BLACK);
		lblNewLabelCount.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabelCount);

		x = x+_x;
		//Label to contain text for link 1
		JLabel lblNewLabel = new JLabel("");
		lblNewLabel.setForeground(SystemColor.textHighlight);
		lblNewLabel.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel);
		
		x = x+_x;
		//Label to contain heading for link 1
		JLabel lblNewLabel_11 = new JLabel("");
		lblNewLabel_11.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_11.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_11);
		
		x = x+_x;
		//Label to contain text for link 1
		JLabel lblNewLabel_1 = new JLabel("");
		lblNewLabel_1.setForeground(SystemColor.textHighlight);
		lblNewLabel_1.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_1);
		
		x = x+_x;
		//Label to contain heading for link 2
		JLabel lblNewLabel_12 = new JLabel("");
		lblNewLabel_12.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_12.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_12);
		
		x = x+_x;
		//Label to contain text for link 2
		JLabel lblNewLabel_2 = new JLabel("");
		lblNewLabel_2.setForeground(SystemColor.textHighlight);
		lblNewLabel_2.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_2);
		
		x = x+_x;
		//Label to contain heading for link 3
		JLabel lblNewLabel_13 = new JLabel("");
		lblNewLabel_13.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_13.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_13);
		
		x = x+_x;
		//Label to contain text for link 3
		JLabel lblNewLabel_3 = new JLabel("");
		lblNewLabel_3.setForeground(SystemColor.textHighlight);
		lblNewLabel_3.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_3);
		
		x = x+_x;
		//Label to contain heading for link 4
		JLabel lblNewLabel_14 = new JLabel("");
		lblNewLabel_14.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_14.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_14);
		
		x = x+_x;
		//Label to contain text for link 4
		JLabel lblNewLabel_4 = new JLabel("");
		lblNewLabel_4.setForeground(SystemColor.textHighlight);
		lblNewLabel_4.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_4);
		
		x = x+_x;
		//Label to contain heading for link 5
		JLabel lblNewLabel_15 = new JLabel("");
		lblNewLabel_15.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_15.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_15);
		
		x = x+_x;
		//Label to contain text for link 5
		JLabel lblNewLabel_5 = new JLabel("");
		lblNewLabel_5.setForeground(SystemColor.textHighlight);
		lblNewLabel_5.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_5);
		
		x = x+_x;
		//Label to contain heading for link 6
		JLabel lblNewLabel_16 = new JLabel("");
		lblNewLabel_16.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_16.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_16);
		
		x = x+_x;
		//Label to contain text for link 6
		JLabel lblNewLabel_6 = new JLabel("");
		lblNewLabel_6.setForeground(SystemColor.textHighlight);
		lblNewLabel_6.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_6);
		
		x = x+_x;
		
		//Label to contain heading for link 7
		JLabel lblNewLabel_17 = new JLabel("");
		lblNewLabel_17.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_17.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_17);
		
		x = x+_x;
		//Label to contain text for link 7
		JLabel lblNewLabel_7 = new JLabel("");
		lblNewLabel_7.setForeground(SystemColor.textHighlight);
		lblNewLabel_7.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_7);
		
		x = x+_x;
		//Label to contain heading for link 8
		JLabel lblNewLabel_18 = new JLabel("");
		lblNewLabel_18.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_18.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_18);
		
		x = x+_x;
		//Label to contain text for link 8
		JLabel lblNewLabel_8 = new JLabel("");
		lblNewLabel_8.setForeground(SystemColor.textHighlight);
		lblNewLabel_8.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_8);
		
		x = x+_x;
		//Label to contain heading for link 9
		JLabel lblNewLabel_19 = new JLabel("");
		lblNewLabel_19.setFont(new Font("Tahoma", Font.PLAIN, 16));
		lblNewLabel_19.setBounds(10, x, 270, 24);
		getContentPane().add(lblNewLabel_19);
		
		x = x+_x;
		//Label to contain text for link 9
		JLabel lblNewLabel_9 = new JLabel("");
		lblNewLabel_9.setForeground(SystemColor.textHighlight);
		lblNewLabel_9.setBounds(10, x, 683, 29);
		getContentPane().add(lblNewLabel_9);
		
		//Search Field for searching
		txtSearch = new JTextField();
		txtSearch.setBackground(SystemColor.textHighlightText);
		txtSearch.setHorizontalAlignment(SwingConstants.LEFT);
		txtSearch.setFont(new Font("Arial", Font.PLAIN, 14));
		txtSearch.setText("Search");
		txtSearch.setBounds(10, 22, 404, 43);
		getContentPane().add(txtSearch);
		txtSearch.setColumns(10);
		
		JButton btnNewButton = new JButton("");
		btnNewButton.setBorder(null);
		btnNewButton.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {

	
                ArrayList<WikiCrawler> workers = new ArrayList<>();
                 String searchTerms = txtSearch.getText();
                 ArrayList<String> finallis = new ArrayList<String>();
                 try {
                    String[] args = null;
                    SearchFiles obj = new SearchFiles(searchTerms);
                    List<Entry<Integer, Double>> list = obj.search_results();
                    System.out.println("Check this please"+list);
                    System.out.println("The list size is"+list.size());
                    //sort opposite
                    
                    for (int i=list.size()-1; i>list.size()-11 ; i--) {
                    	System.out.print("printing the index");
                        String Vname1 = String.valueOf(list.get(i));
                        String newVname1 = Vname1.replaceFirst("=.*", "");
                        int file = Integer.parseInt(newVname1)+1;
              
                        finallis.add(String.valueOf(file));
                     }
                    
                } catch (Exception e2) {
                    // TODO Auto-generated catch block
                    e2.printStackTrace();
                }
                 
		
				
				String filePath = "Jsonfile/"+finallis.get(0)+".json";
                String filePath1 = "Jsonfile/"+finallis.get(1)+".json";
                String filePath2 = "Jsonfile/"+finallis.get(2)+".json";
                String filePath3 = "Jsonfile/"+finallis.get(3)+".json";
                String filePath4 = "Jsonfile/"+finallis.get(4)+".json";
                String filePath5 = "Jsonfile/"+finallis.get(5)+".json";
                String filePath6 = "Jsonfile/"+finallis.get(6)+".json";
                String filePath7 = "Jsonfile/"+finallis.get(7)+".json";
                String filePath8 = "Jsonfile/"+finallis.get(8)+".json";
                String filePath9 = "Jsonfile/"+finallis.get(9)+".json";
                JSONParser jsonParser = new JSONParser();

  
                
                try(FileReader reader = new FileReader(filePath)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      firstlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath1)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                       secondlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath2)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                       thirdlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath3)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                       fourlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath4)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      fivelink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath5)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      sixlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath6)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      sevenlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath7)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      eightlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath8)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      ninelink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
                try(FileReader reader = new FileReader(filePath9)){
                    Object obj = jsonParser.parse(reader);
                      JSONObject jsonObject = (JSONObject)obj;
                      //String firstName = (String) obj.get("Title"); 
                      tenlink = (String) jsonObject.get("URL");
                    } catch (FileNotFoundException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (IOException e2) {
						// TODO Auto-generated catch block
						e2.printStackTrace();
					} catch (ParseException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
			
				
				
				lblNewLabel.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
					        	//On click of link open in desktop
					        	Desktop.getDesktop().browse(new URI(firstlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					    
						}
				});
				
			
				
				//Set the Link to label
				lblNewLabel.setText(firstlink);
				
				
				lblNewLabel_1.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(secondlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					    
					    
					}
				});
				
				//Set the Link to label
				lblNewLabel_1.setText(secondlink);
				
				lblNewLabel_2.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
					        try {
								Desktop.getDesktop().browse(new URI(thirdlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}  
					}
				});
				//Set the Link to label
				lblNewLabel_2.setText(thirdlink);
				
				lblNewLabel_3.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(fourlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				//Set the Link to label
				
				lblNewLabel_3.setText(fourlink);
				
				lblNewLabel_4.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(fivelink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				
				//Set the Link to label
				lblNewLabel_4.setText(fivelink);
				
				lblNewLabel_5.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(sixlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				
				//Set the Link to label
				lblNewLabel_5.setText(sixlink);
				
				lblNewLabel_6.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(sevenlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}					    
					}
				});
				
				//Set the Link to label
				lblNewLabel_6.setText(sevenlink);
				 
				lblNewLabel_7.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
					        	final String link1 = eightlink;
								Desktop.getDesktop().browse(new URI(eightlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				
				//Set the Link to label
				lblNewLabel_7.setText(eightlink);
				
				lblNewLabel_8.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(ninelink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				
				//Set the Link to label
				lblNewLabel_8.setText(ninelink);
				
				lblNewLabel_9.addMouseListener(new MouseAdapter() {
					@Override
					public void mouseClicked(MouseEvent e) {
						
					        try {
								Desktop.getDesktop().browse(new URI(tenlink));
							} catch (IOException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							} catch (URISyntaxException e1) {
								// TODO Auto-generated catch block
								e1.printStackTrace();
							}
					}
				});
				
				lblNewLabel_9.setText(tenlink);
			}


		});
		btnNewButton.setForeground(Color.WHITE);
		//here change the image path
		//In this line just change the image according to your system path
		//Like the one below
//		btnNewButton.setIcon(new ImageIcon("D:/otherWork/csc3010/csc3010/webcrawler_project/src/webcrawler_project/im/search.png"));
		btnNewButton.setText("Search");
		btnNewButton.setBackground(new Color(255, 204, 0));
		btnNewButton.setBounds(434, 22, 60, 40);
		getContentPane().add(btnNewButton);
		
	}

}
