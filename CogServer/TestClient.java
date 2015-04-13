import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

import org.restlet.resource.*;
import org.restlet.representation.*;
import org.restlet.data.*;

public class TestClient extends ClientResource {

    public static void main(String[] args) throws Exception {
        ClientResource cliRes = new ClientResource("http://128.164.205.100:8182/rest/test");
	RestInterface rest = cliRes.wrap(RestInterface.class);
	
	BufferedImage img;
	ByteArrayOutputStream baos = new ByteArrayOutputStream();
	byte[] inbytes;
	
	//for(int i=3; i<7; i++) {
	    try {
		
		String fname = String.format("test_images/image%d.jpg", 0);//i*2);
		
		img = ImageIO.read(new File(fname));
		ImageIO.write(img, "jpg", baos);
		inbytes = baos.toByteArray();
		
		Representation out = new InputRepresentation(new ByteArrayInputStream(inbytes), MediaType.IMAGE_JPEG);
		System.out.printf("%s\n", rest.identify(out));
		
	    }catch(IOException e) {
		System.out.println(e);
		return;
	    }
	    //}
    }
}
