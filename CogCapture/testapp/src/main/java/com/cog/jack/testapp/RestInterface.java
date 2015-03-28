package com.cog.jack.testapp;

import android.graphics.Bitmap;

import org.restlet.resource.Delete;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.Put;
import org.restlet.representation.*;

//import java.awt.image.*;

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
