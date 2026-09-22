package com.bgkwear.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.codetrix.studio.capacitor.google.Auth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        registerPlugin(GoogleAuth.class);
    }
}