import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

import org.restlet.resource.*;
import org.restlet.representation.*;
import org.restlet.data.*;

public interface RestInterface {

    @Get
    public String retrieve(String str);

    @Put
    public void store(Representation byteRep);

    @Post
    public String identify(Representation byteRep) throws Exception;

    @Delete
    public void remove() throws Exception;

}
