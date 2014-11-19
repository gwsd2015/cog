import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

public class TestPiece {
    public static void main(String[] args) {
	BufferedImage imageA = null;
	BufferedImage imageB = null;
	
	try {
	    imageA = ImageIO.read(new File("whitehouse1.jpg"));
	    imageB = ImageIO.read(new File("whitehouse2.jpg"));

	    PieceInfo whouse = new PieceInfo("whitehouse");
	    whouse.addImage(imageA);
	    
	    System.out.printf("ratio:%f\n", whouse.compareImage(imageB));
	}catch(IOException e) {
	    
	}
	
	
	
        //SurfCompare show = new SurfCompare(imageA,imageB);
        //show.display();
    }
}
