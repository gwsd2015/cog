package com.example.jack.imagetoserver;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.MotionEvent;

import com.gdkdemo.camera.service.CameraDemoLocalService;
import com.google.android.glass.media.CameraManager;
import com.google.android.glass.touchpad.Gesture;
import com.google.android.glass.touchpad.GestureDetector;

import java.util.ArrayList;


// The "main" activity...
public class CameraDemoActivity extends Activity
{
    private final int IMAGE_CAPTURE_REQUEST_CODE = 101;

    // For tap event
    private GestureDetector mGestureDetector;

    // Service to handle liveCard publishing, etc...
    private boolean mIsBound = false;
    private CameraDemoLocalService cameraDemoLocalService = null;
    private ServiceConnection serviceConnection = new ServiceConnection() {
        public void onServiceConnected(ComponentName className, IBinder service) {
            Log.d("onServiceConnected() called.");
            cameraDemoLocalService = ((CameraDemoLocalService.LocalBinder)service).getService();
        }
        public void onServiceDisconnected(ComponentName className) {
            Log.d("onServiceDisconnected() called.");
            cameraDemoLocalService = null;
        }
    };
    private void doBindService()
    {
        bindService(new Intent(this, CameraDemoLocalService.class), serviceConnection, Context.BIND_AUTO_CREATE);
        mIsBound = true;
    }
    private void doUnbindService() {
        if (mIsBound) {
            unbindService(serviceConnection);
            mIsBound = false;
        }
    }
    private void doStartService()
    {
        startService(new Intent(this, CameraDemoLocalService.class));
    }
    private void doStopService()
    {
        stopService(new Intent(this, CameraDemoLocalService.class));
    }

    // ???
    private CameraDemoLocalService getCameraDemoLocalService()
    {
        if(cameraDemoLocalService == null) {
//            // ????
//            doBindService();
        }
        return cameraDemoLocalService;
    }


    @Override
    protected void onDestroy()
    {
        doUnbindService();
        super.onDestroy();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        Log.d("onCreate() called.");

        setContentView(R.layout.activity_camerademo);

        // For gesture handling.
        mGestureDetector = createGestureDetector(this);

        // We need a real service.
        // bind does not work. We need to call start() explilicitly...
        // doBindService();
        doStartService();
        // TBD: We need to call doStopService() when user "closes" the app....
        // ...

    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event)
    {
        if (keyCode == KeyEvent.KEYCODE_CAMERA) {
            // Stop the preview and release the camera.
            // Execute your logic as quickly as possible
            // so the capture happens quickly.
            return false;
        } else {
            return super.onKeyDown(keyCode, event);
        }
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        if (requestCode == IMAGE_CAPTURE_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {

                if(data != null) {
                    Bundle extras = data.getExtras();
                    if(extras != null) {
                        // Note: Apparently there is currently a bug.
                        // https://developers.google.com/glass/develop/gdk/reference/com/google/android/glass/media/Camera#EXTRA_THUMBNAIL_FILE_PATH
                        String thumbnailFilePath = extras.getString(CameraManager.EXTRA_THUMBNAIL_FILE_PATH);
                        if(Log.I) Log.i("thumbnailFilePath = " + thumbnailFilePath);

                        String pictureFilePath = extras.getString(CameraManager.EXTRA_PICTURE_FILE_PATH);
                        if(Log.D) Log.d("pictureFilePath = " + pictureFilePath);

                        // TBD:
                        if(getCameraDemoLocalService() != null) {
                            if(Log.D) Log.d("Calling cameraDemoLocalService.setPhotoFilePath() with pictureFilePath = " + pictureFilePath);
                            getCameraDemoLocalService().setPhotoFilePath(pictureFilePath);
                        } else {
                            // Can this happen???
                            Log.w("cameraDemoLocalService is null!!!");
                        }

                    } else {
                        Log.w("The returned intent does not include extras.");
                    }
                } else {
                    // Can this happen?
                    Log.w("Null Intent data returned.");
                }
            } else {
                Log.i("Request failed: resultCode = " + resultCode);
            }
        }
        // Call super?
        super.onActivityResult(requestCode, resultCode, data);
    }


    // TBD:
    // Just use context menu instead of gesture ???
    // ...

    @Override
    public boolean onGenericMotionEvent(MotionEvent event)
    {
        if (mGestureDetector != null) {
            return mGestureDetector.onMotionEvent(event);
        }
        return false;
    }

    private GestureDetector createGestureDetector(Context context)
    {
        GestureDetector gestureDetector = new GestureDetector(context);
        //Create a base listener for generic gestures
        gestureDetector.setBaseListener( new GestureDetector.BaseListener() {
            @Override
            public boolean onGesture(Gesture gesture) {
                if(Log.D) Log.d("gesture = " + gesture);
                if (gesture == Gesture.TAP) {
                    handleGestureTap();
                    return true;
                } else if (gesture == Gesture.TWO_TAP) {
                    handleGestureTwoTap();
                    return true;
                } else if (gesture == Gesture.SWIPE_RIGHT) {
                    handleGestureSwipeRight();
                    return true;
                } else if (gesture == Gesture.SWIPE_LEFT) {
                    handleGestureSwipeLeft();
                    return true;
                }
                return false;
            }
        });
        return gestureDetector;
    }



    // Tap triggers photo taking...
    private void handleGestureTap()
    {
        Log.d("handleGestureTap() called.");

        // ???
        if(cameraDemoLocalService == null) {
            // ????
            doBindService();
        }

        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(intent, IMAGE_CAPTURE_REQUEST_CODE);
    }

    private void handleGestureTwoTap()
    {
        Log.d("handleGestureTwoTap() called.");

        // Quit
        this.finish();
    }

    private void handleGestureSwipeRight()
    {
        Log.d("handleGestureSwipeRight() called.");


    }

    private void handleGestureSwipeLeft()
    {
        Log.d("handleGestureSwipeLeft() called.");


    }



}
