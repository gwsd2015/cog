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

    public String retrieve(String str) {
	if(str.equals("change"))
	    s = "changed";
	
	System.out.printf("GET received\n");
	return s;
    }

    public void store(String str) {
	System.out.printf("PUT received\n");
	s = str;
    }

    private PieceInfo getTestPiece(BufferedImage img) {
	return new PieceInfo("thing", "Jack", 1999);
    }

    public PieceInfo identify(BufferedImage img) throws Exception {
        System.out.println("POST request received");
	PieceInfo test = getTestPiece(img);
	System.out.println("test");
	return test;//getTestPiece(img);
    }

    public void remove() throws Exception {
        System.out.println("DELETE request received");
        //myCustomer = null;
    }
}
