import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;
import com.stromberglabs.jopensurf.*;

public class TestPiece {
    public static void main(String[] args) {
	BufferedImage imageA = null;
	BufferedImage imageB = null;
	
	try {
	    imageA = ImageIO.read(new File("whitehouse1.jpg"));
	    imageB = ImageIO.read(new File("whitehouse2.jpg"));
	    
	    Surf surfA = new Surf(imageA);
	    Surf surfB = new Surf(imageB);
	    
	    surfA.getFreeOrientedInterestPoints();
	    surfB.getFreeOrientedInterestPoints();
	    
	    Map<SURFInterestPoint, SURFInterestPoint> matches;
	    
	    long i = System.currentTimeMillis();
	    matches = surfA.getMatchingPoints(surfB, false);
	    long h = System.currentTimeMillis();
	    matches = surfA.getMatchingPoints(surfB, false);
	    long f = System.currentTimeMillis();

	    System.out.printf("%d | %d\n", h-i, f-h);
	    
	    /*
	    PieceInfo whouse = new PieceInfo("whitehouse");
	    whouse.addImage(imageA);
	    
	    System.out.printf("ratio:%f\n", whouse.compareImage(imageB));*/
	}catch(IOException e) {
	    
	}
	
	
	
        //SurfCompare show = new SurfCompare(imageA,imageB);
        //show.display();
    }
}
