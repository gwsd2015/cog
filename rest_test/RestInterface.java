import java.util.*;
import java.awt.*;
import java.awt.image.*;
import java.io.*;
import javax.imageio.*;

import org.restlet.resource.*;

public interface RestInterface {

    @Get
    public String retrieve(String str);

    @Put
    public void store(String str);

    @Post
    public PieceInfo identify(BufferedImage img) throws Exception;

    @Delete
    public void remove() throws Exception;

}
