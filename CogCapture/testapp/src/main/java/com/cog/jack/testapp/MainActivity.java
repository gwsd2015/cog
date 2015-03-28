package com.cog.jack.testapp;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.media.AudioManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.widget.AdapterView;
import android.widget.FrameLayout;

import com.google.android.glass.media.Sounds;
import com.google.android.glass.widget.CardBuilder;
import com.google.android.glass.widget.CardScrollView;

import org.restlet.data.MediaType;
import org.restlet.resource.ClientResource;
import org.restlet.representation.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class MainActivity extends Activity {
    private CardScrollView mCardScroller;
    private CardAdapter mAdapter;

    private static final int TAKE_PICTURE_REQUEST = 1;

    @Override
    protected void onCreate(Bundle bundle) {
        super.onCreate(bundle);

        CardBuilder first = new CardBuilder(this, CardBuilder.Layout.TEXT)
                .setText("Tap to take a pic");

        mCardScroller = new CardScrollView(this);
        mAdapter = new CardAdapter(first);
        mCardScroller.setAdapter(mAdapter);
        mCardScroller.activate();

        setupClickListener();
        setContentView(mCardScroller);
    }

    private void setupClickListener() {
        final Context context = this;
        mCardScroller.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

                if (position == 0) {
                    am.playSoundEffect(Sounds.TAP);
                    takePicture();

                    //new RetrieveInfoTask().execute();
                } else {
                    am.playSoundEffect(Sounds.DISALLOWED);
                }
            }
        });
    }

    private void takePicture() {
        startActivityForResult(new Intent(MainActivity.this, CameraActivity.class), TAKE_PICTURE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if(requestCode == TAKE_PICTURE_REQUEST) {
            if(resultCode == RESULT_OK) {
                System.out.println("It worked!");
                System.out.println(data.getData().getPath());

                new RetrieveInfoTask().execute(data.getData().getPath());
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        mCardScroller.activate();
    }

    @Override
    protected void onPause() {
        mCardScroller.deactivate();
        super.onPause();
    }

    private void addImageCard(String str, Bitmap bitmap) {
        mAdapter.addCard(new CardBuilder(this, CardBuilder.Layout.TEXT)
                .setText(str)
                .addImage(bitmap));
        mCardScroller.animate(1, CardScrollView.Animation.INSERTION);
    }

    private class RetrieveInfoTask extends AsyncTask<String, String, String> {
        Bitmap bitmap;

        @Override
        protected String doInBackground(String... paths) {
            try {
                ClientResource cliRes = new ClientResource("http://128.164.211.118:8182/rest/test");//("http://localhost:8182/rest/test");
                RestInterface rest = cliRes.wrap(RestInterface.class);

                bitmap = BitmapFactory.decodeFile(paths[0]);
                ByteArrayOutputStream blob = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, blob);
                byte[] bitmapdata = blob.toByteArray();

                Representation out = new InputRepresentation(new ByteArrayInputStream(bitmapdata), MediaType.IMAGE_JPEG);
                //rest.store(out);
                return rest.identify(out);
            } catch (Exception e) {
                System.out.println(e);
            }
            return null;
        }

        @Override
        protected void onPostExecute(String str) {
            addImageCard(str, bitmap);
        }
    }
}
