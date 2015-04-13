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

public class TestServer extends ServerResource implements RestInterface {
    private static ArrayList<PieceInfo> pieces;
    static int ind;
    private static final double TOLERANCE = 0.1;
    private static final Server server = new Server(Protocol.HTTP, 8182,
						    TestServer.class);

    private static void loadPieces() {
	String[] titles = {"Guernica", "American Gothic",
			   "The Persistence Of Memory", "Girl With a Pearl Earing",
			   "A Starry Night", "The Scream"};
	String[] artists = {"Pablo Picasso", "Grant Wood", "Salvador Dali",
			    "Johannes Vermeer", "Vincent van Gogh", "Edvard Munch"};
	int[] years = {1937, 1930, 1931, 1665, 1889, 1893};

	pieces.clear();
	
	try {
	    for(int i=0; i<titles.length; i++) {
		PieceInfo temp = new PieceInfo(titles[i], artists[i], years[i]);
		String fname = String.format("../image%d.jpg", i*2+1);
		
		temp.addImage(ImageIO.read(new File(fname)));
		pieces.add(temp);
	    }
	} catch(IOException e) {
	    System.out.println(e);
	}
    }
    
    public static void main(String[] args) throws Exception {
        pieces = new ArrayList<PieceInfo>();

	System.out.printf("Loading pieces, calculating IPoints...");
	loadPieces();
	System.out.printf("Finished\n");
	ind = 0;
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
    
    //PUT - write image to file
    public void store(Representation byteRep) {
	System.out.printf("PUT received\n");
	
	File output = new File(String.format("image%d.jpg", ind));
	try {
	    ImageIO.write(processImg(byteRep), "jpg", output);
	    ind++;
	}
	catch (IOException e) {
	    System.out.println(e);
	}
    }
    
    private ArrayList<PieceInfo> findMatchingThumbs(BufferedImage img) {
	ArrayList<PieceInfo> out = new ArrayList<PieceInfo>();
	Surf thumb = new Surf(PieceInfo.resizeImage(img, img.getType()));
	
	for(PieceInfo piece:pieces) {
	    double ratio = piece.compareThumb(thumb);
	    
	    if(ratio > TOLERANCE) {
		out.add(piece);
	    }
	}
	return out;
    }
    
    private String findMatchO(BufferedImage img) {
	Surf in = new Surf(img);
	
	for(PieceInfo piece:pieces) {
	    double ratio = piece.compareImage(in);
	    System.out.println(piece.toString() + " - " + ratio + "\n");
	    
	    if(ratio > TOLERANCE) {
		return piece.toString();
	    }
	}
	return "No match found";
    }
    
    private String findMatch(BufferedImage img) {
	ArrayList<PieceInfo> poss = findMatchingThumbs(img);
	
	if(poss.isEmpty()) {
	    poss.addAll(pieces);
	}
	if(poss.size() == 1) {
	    return poss.get(0).toString();
	}
	else {
	    Surf in = new Surf(img);
	
	    for(PieceInfo piece:poss) {
		double ratio = piece.compareImage(in);
		System.out.println(piece.toString() + " - " + ratio);
	    
		if(ratio > TOLERANCE) {
		    return piece.toString();
		}
	    }
	}
	return "No match found";
    }
    
    //converts Restlet rep into BufferedImage for jopenSURF
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
	
	BufferedImage bi = processImg(byteRep);
	long ave1 = 0;//full
	long ave2 = 0;//thumbs
	long i, h, f;
	String one = "", two = "";
	
	for(int k=0; k<20; k++) {
	    i = System.currentTimeMillis();
	    one = findMatch(bi);
	    h = System.currentTimeMillis();
	    ave2 += h-i;
	    
	    two = findMatchO(bi);
	    f = System.currentTimeMillis();
	    ave1 += f-h;
	    
	    //loadPieces();
	}
	
	System.out.printf("%d | %d\n", ave1/20, ave2/20);
	return one;
	//return findMatch(processImg(byteRep));
    }

    //DELETE - might use to help modify db
    public void remove() throws Exception {
        System.out.println("DELETE request received");
        //myCustomer = null;
    }
}
