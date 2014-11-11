import com.stromberglabs.jopensurf.*;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import javax.swing.*;

public class Test {
    public static void main(String[] args) {
	BufferedImage imageA = null;
	
	try {
	    imageA = ImageIO.read(new File("whitehouse1.jpg"));
        
	    Surf test = new Surf(imageA);
	    List<SURFInterestPoint> points = test.getFreeOrientedInterestPoints();

	    System.out.println(points.size() + " interest points");
	    
	}catch(IOException e) {

	}
	
	BufferedImage imageB = null;
	
	try {
	    imageB = ImageIO.read(new File("whitehouse2.jpg"));
        }catch(IOException e) {

	}
	
	
	
        //SurfCompare show = new SurfCompare(imageA,imageB);
        //show.display();
    }
}
