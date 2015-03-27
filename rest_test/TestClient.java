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
        ClientResource cliRes = new ClientResource("http://128.164.211.118:8182/rest/test");
	RestInterface rest = cliRes.wrap(RestInterface.class);
	
	BufferedImage img;
	ByteArrayOutputStream baos = new ByteArrayOutputStream();
	byte[] inbytes;
	
	try {
	    img = ImageIO.read(new File("test_image3.jpg"));
	    ImageIO.write(img, "jpg", baos);
	    inbytes = baos.toByteArray();
	}catch(IOException e) {
	    System.out.println(e);
	    return;
	}
	
	Representation out = new InputRepresentation(new ByteArrayInputStream(inbytes), MediaType.IMAGE_JPEG);
	System.out.printf("%s\n", rest.identify(out));
    }
}
