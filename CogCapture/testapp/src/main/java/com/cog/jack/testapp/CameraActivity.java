package com.cog.jack.testapp;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.hardware.Camera;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.KeyEvent;
import android.view.SurfaceView;
import android.view.View;
import android.widget.AdapterView;
import android.widget.FrameLayout;

import com.google.android.glass.media.Sounds;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;


public class CameraActivity extends Activity {
    private Camera mCamera;
    private CameraPreview mPreview;
    private File pictureFile;

    public static final int MEDIA_TYPE_IMAGE = 1;
    public static final int MEDIA_TYPE_VIDEO = 2;
    public static final String TAG = "Cog";

    private Camera.PictureCallback mPicture = new Camera.PictureCallback() {

        @Override
        public void onPictureTaken(byte[] data, Camera camera) {

            pictureFile = getOutputMediaFile(MEDIA_TYPE_IMAGE);
            if (pictureFile == null) {
                Log.d(TAG, "Error creating media file, check storage permissions: ");
                return;
            }

            try {
                FileOutputStream fos = new FileOutputStream(pictureFile);
                fos.write(data);
                fos.close();
            } catch (FileNotFoundException e) {
                Log.d(TAG, "File not found: " + e.getMessage());
            } catch (IOException e) {
                Log.d(TAG, "Error accessing file: " + e.getMessage());
            }

            Intent picData = new Intent(Intent.CATEGORY_TEST, Uri.fromFile(pictureFile));
            setResult(RESULT_OK, picData);
            finish();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        mCamera = getCameraInstance();

        mPreview = new CameraPreview(this, mCamera);

        FrameLayout preview = (FrameLayout) findViewById(R.id.camera_preview);
        preview.addView(mPreview);
    }
    /*
    protected void onStop() {
        Intent picData = new Intent(Intent.CATEGORY_TEST, Uri.fromFile(pictureFile));
        setResult(RESULT_OK, picData);
        super.onStop();
    }
    */
    @Override
    public boolean onKeyDown(int keycode, KeyEvent event) {
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);

        if(keycode == KeyEvent.KEYCODE_DPAD_CENTER) {
            am.playSoundEffect(Sounds.TAP);
            mCamera.takePicture(null, null, mPicture);

            return true;
        }
        return super.onKeyDown(keycode, event);
    }

    public static Camera getCameraInstance(){
        Camera c = null;
        try {
            c = Camera.open(); // attempt to get a Camera instance
        }
        catch (Exception e){
            System.out.println(e);
            // Camera is not available (in use or does not exist)
        }
        return c; // returns null if camera is unavailable
    }

    private File getOutputMediaFile(int type){
        //File mediaStorageDir = new File(Environment.getDataDirectory(), "Cog");
        File mediaStorageDir = new File(this.getFilesDir(), "Cog");

        // Create the storage directory if it does not exist
        if (! mediaStorageDir.exists()){
            if (! mediaStorageDir.mkdirs()){
                Log.d("Cog", "failed to create directory");
                return null;
            }
        }

        // Create a media file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File mediaFile;
        if (type == MEDIA_TYPE_IMAGE){
            mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                    "IMG_"+ timeStamp + ".jpg");
        } else if(type == MEDIA_TYPE_VIDEO) {
            mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                    "VID_"+ timeStamp + ".mp4");
        } else {
            return null;
        }

        return mediaFile;
    }
}
