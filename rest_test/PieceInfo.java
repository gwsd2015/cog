import com.stromberglabs.jopensurf.*;
import java.util.*;
import java.awt.*;
import java.awt.image.*;

//holds information on piece of art with list of images of piece
public class PieceInfo {
    private String artist, name;
    private int year;
    private ArrayList<BufferedImage> images;

    //initializes with given name and default artist and year
    public PieceInfo(String nm) {
	name = nm;
	artist = "unknown";
	year = 0;
	images = new ArrayList<BufferedImage>();
    }

    //initializes with given input
    public PieceInfo(String nm, String art, int y) {
	name = nm;
	artist = art;
	year = y;
	images = new ArrayList<BufferedImage>();
    }
    
    public String getName() {
	return name;
    }

    public void setName(String n) {
	name = n;
    }

    public String getArtist() {
	return artist;
    }

    public void setArtist(String a) {
	artist = a;
    }

    public int getYear() {
	return year;
    }
    
    public void setYear(int y) {
	year = y;
    }

    public void addImage(BufferedImage img) {
	images.add(img);
    }

    public String toString() {
	return String.format("Name:%s\nArtist:%s\nYear:%s", getName(), getArtist(), getYear());
    }


    //TO CHANGE - initialize surfs right away so IPoints can be calculated and stored
    //compares images
    //returns ratio of matching points to total points of interest
    private double surfCompare(BufferedImage imgA, BufferedImage imgB) {
	Surf surfA = new Surf(imgA);
	Surf surfB = new Surf(imgB);
	
	Map<SURFInterestPoint, SURFInterestPoint> matchesA = surfA.getMatchingPoints(surfB, false);
	//Map<SURFInterestPoint, SURFInterestPoint> matchesB;
	
       	int pointsA = surfA.getFreeOrientedInterestPoints().size();
	
	return (double)matchesA.size() / (double)pointsA;
    }
    
    //compares an input image to each image in list and returns
    //strongest percentage of matched points of interest
    public double compareImage(BufferedImage input) {
	double ratio = 0.0;
	
	for(BufferedImage img:images) {
	    double cur = surfCompare(img, input);
	    
	    if(cur > ratio)
		ratio = cur;
	}
	return ratio;
    }
}
