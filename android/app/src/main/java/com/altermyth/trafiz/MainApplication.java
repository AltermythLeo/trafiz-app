package com.altermyth.trafiz;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.christopherdro.RNPrint.RNPrintPackage;
import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;
import org.reactnative.camera.RNCameraPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.tkporter.sendsms.SendSMSPackage;
import com.horcrux.svg.SvgPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNPrintPackage(),
          new RNHTMLtoPDFPackage(),
          new SQLitePluginPackage(),
          new RNCameraPackage(),
          new SvgPackage(),
          new AsyncStoragePackage(),
          SendSMSPackage.getInstance()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
