import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

import org.restlet.resource.*;

/*import org.restlet.ext.json.*;
import org.json.simple.*;
import org.json.simple.parser.*;
*/
public class TestClient extends ClientResource {

    public static void main(String[] args) throws Exception {
        ClientResource cliRes = new ClientResource("http://localhost:8182/rest/test");
	RestInterface rest = cliRes.wrap(RestInterface.class);

	BufferedImage img = null;
	
	try {
	    img = ImageIO.read(new File("whitehouse1.jpg"));
	}catch(IOException e) {
	    
	}
	
	PieceInfo match = rest.identify(img);
	
	System.out.printf("%s\n", match.toString());

	/*
	JSONObject jobj = new JSONObject();
	jobj.put("testkey", "testval");

	JsonRepresentation jrep = new JsonRepresentation(jobj);

	JSONObject info = testRes.post(jrep).getJsonObject();
	*/
	
	//System.out.printf("%s\n", rest.post("test"));//info.get("testkey"));
    }
}
