import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

import org.restlet.*;
import org.restlet.data.Protocol;
import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;
//import org.restlet.ext.jackson.*;

public class CogServer extends ServerResource implements RestInterface {
    private static String s;
    private static final Server server = new Server(Protocol.HTTP, 8182,
						    CogServer.class);

    public static void main(String[] args) throws Exception {
	s = "def";
	
	Context ctx = new Context();
        server.setContext(ctx);
        server.getContext().getParameters().add("keystorePassword", "password");
        server.start();
    }
    
    //GET - not sure if needed yet
    public String retrieve(String str) {
	if(str.equals("change"))
	    s = "changed";
	
	System.out.printf("GET received\n");
	return s;
    }
    
    //PUT - will likely use for building db of images
    public void store(String str) {
	System.out.printf("PUT received\n");
	s = str;
    }
    
    //TO DELETE
    private PieceInfo getTestPiece(BufferedImage img) {
	return new PieceInfo("thing", "Jack", 1999);
    }
    
    //POST - receives image from client and returns matching PieceInfo object
    public String identify(BufferedImage img) throws Exception {
        System.out.println("POST request received");
	PieceInfo test = getTestPiece(img);
	System.out.println("test");
	return test.toString();//getTestPiece(img);
    }

    //DELETE - might use to help modify db
    public void remove() throws Exception {
        System.out.println("DELETE request received");
        //myCustomer = null;
    }
}
