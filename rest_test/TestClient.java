import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;
import org.restlet.resource.*;

public class TestClient extends ClientResource {

    public static void main(String[] args) throws Exception {
        ClientResource cliRes = new ClientResource("http://localhost:8182/rest/test");
	RestInterface rest = cliRes.wrap(RestInterface.class);

	BufferedImage img = null;
	
	try {
	    img = ImageIO.read(new File("whitehouse1.jpg"));
	}catch(IOException e) {
	    
	}
	
	String match = rest.identify(img);
	
	System.out.printf("%s\n", match);
    }
}
