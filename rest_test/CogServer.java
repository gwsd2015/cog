import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;
import java.util.*;

import org.restlet.*;
import org.restlet.data.Protocol;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;
import org.restlet.representation.*;

import com.stromberglabs.jopensurf.*;

public class CogServer extends ServerResource implements RestInterface {
    private static ArrayList<PieceInfo> pieces;
    
    private static final double TOLERANCE = 0.1;
    private static final Server server = new Server(Protocol.HTTP, 8182,
						    CogServer.class);

    private static void loadPieces() {
	PieceInfo melt = new PieceInfo("Melt Shop", "Jack Shannon", 2015);
	PieceInfo sbux = new PieceInfo("Starbucks", "Jack Shannon", 2015);
	
	try {
	    melt.addImage(ImageIO.read(new File("image0.jpg")));
	    melt.addImage(ImageIO.read(new File("image1.jpg")));
	    melt.addImage(ImageIO.read(new File("image2.jpg")));
	    //melt.addImage(ImageIO.read(new File("test_image3.jpg")));
	    
	    sbux.addImage(ImageIO.read(new File("image00.jpg")));
	    sbux.addImage(ImageIO.read(new File("image01.jpg")));
	    //sbux.addImage(ImageIO.read(new File("image02.jpg")));
	} catch(IOException e) {
	    System.out.println(e);
	}
	
	pieces.add(sbux);
	pieces.add(melt);
    }
    
    public static void main(String[] args) throws Exception {
        pieces = new ArrayList<PieceInfo>();

	System.out.printf("Loading pieces, calculating IPoints...");
	loadPieces();
	System.out.printf("Finished\n");
	
	Context ctx = new Context();
        server.setContext(ctx);
        server.getContext().getParameters().add("keystorePassword", "password");
        server.start();
    }
    
    //GET - not sure if needed yet
    public String retrieve(String str) {
	System.out.printf("GET received\n");
	return "GET";
    }
    
    //PUT - will likely use for building db of images
    public void store(Representation byteRep) {
	System.out.printf("PUT received\n");
	
	File output = new File("image0.jpg");
	try {
	    ImageIO.write(processImg(byteRep), "jpg", output);
	}
	catch (IOException e) {
	    System.out.println(e);
	}
    }
    
    //TO DELETE
    private PieceInfo getTestPiece(BufferedImage img) {
	File output = new File("test_image.jpg");
	try {
	    ImageIO.write(img, "jpg", output);
	} catch(IOException e) {
	    System.out.println(e);
	}
	return new PieceInfo("thing", "Jack", 1999);
    }
    
    private String findMatch(BufferedImage img) {
	Surf in = new Surf(img);
	
	for(PieceInfo piece:pieces) {
	    double ratio = piece.compareImage(in);
	    System.out.println(ratio);
	    
	    if(ratio > TOLERANCE) {
		return piece.toString();
	    }
	}
	return "No match found";
    }
    
    private BufferedImage processImg(Representation rep) {
	InputStream stream;
	BufferedImage img;
	
	try {
	    stream = rep.getStream();
	    img = ImageIO.read(stream);
	} catch(IOException e) {
	    System.out.println(e);
	    return null;
	}
	return img;
    }
    
    //POST - receives image from client and returns matching PieceInfo object
    public String identify(Representation byteRep) throws Exception {
        System.out.println("POST request received");
	
	return findMatch(processImg(byteRep));
    }

    //DELETE - might use to help modify db
    public void remove() throws Exception {
        System.out.println("DELETE request received");
        //myCustomer = null;
    }
}
