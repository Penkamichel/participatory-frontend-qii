import { APPS, URLS } from '../constants/enums';
import { _ as t } from "../utils/translate";
import { router, useNavigation, useRootNavigationState } from 'expo-router'; 
import { Alert, Platform } from 'react-native';
import * as Random from 'randomstring';   
// import { NavigationActions } from 'react-navigation';
import { CommonActions, DrawerActions } from '@react-navigation/native';

String.prototype.format = function (...args) {
  // Storing arguments into an array
  //const args = arguments;
    
  // Using replace for iterating over the string
  // Select the match and check whether related arguments are present. 
  // If yes, then replace the match with the argument.
  return this.replace(/{([0-9]+)}/g, function (match, index) {      
    // checking whether the argument is present
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};

const APP = class AppUtil {

  static backendURL = URLS.BACKEND;

  // static DB = DB;

  /**
   * Get app instance from which we can access globar variables
   * @returns
   */
  static get_current_instance() { 
    // const store = InstanceStore();
    // const { proxy } = store.get_current_instance();
    // return proxy;
    return null;
  }
 
  /**
   * Get full backend url
   * @param url 
   */
  static get_full_backend_url(url: string) {
    return AppUtil.backendURL + url;
  }

   /**
   * Translate text
   */
  static _(text: string, params: object={}) {
    return t(text, params)
  }

  /**
   * Show message to user
   * @param title
   * @param message
   * @param on_ok
   * @param on_cancel
   * @param on_dismiss
   */
  static show_message(
    message: string,
    title: string = '',
    // on_ok = null,
    // on_cancel = null,
    // on_dismiss = null
  ) {
    if (!title) {
      title = this._('GLOBAL.DEFAULT_INFO_MESSAGE_TITLE');
    }
    this._show_dialog(title, message, null, null, null, false, false);
  }

  /**
   * Show error message
   * @param title
   * @param message
   * @param on_ok
   * @param on_cancel
   * @param on_dismiss
   */
  static show_error(
    message: string,
    title = '',
    // on_ok = null,
    // on_cancel = null,
    // on_dismiss = null
  ) {
    if (title === '' || !title) {
      title = this._('GLOBAL.DEFAULT_ERROR_MESSAGE_TITLE');
    }
    this._show_dialog(title, message, null, null, null, true, false);
  }

  static confirm(message: string, title: '', on_ok =null, on_cancel = null, on_dismiss=null) {
    if (title === '' || !title) {
      title = this._('GLOBAL.DEFAULT_ERROR_MESSAGE_TITLE');
    }
    this._show_dialog(title, message, on_ok, on_cancel, null, false, true);
  }
  /**
   * Display message. Attempt to make use of Quasar dialog
   * @param title
   * @param message
   * @param on_ok
   * @param on_cancel
   * @param on_dismiss
   * @param is_error
   */
  static _show_dialog(
    title: string,
    message: string,
    on_ok = null,
    on_cancel = null,
    on_dismiss = null,
    is_error = false,
    is_confirm = false
  ) {
    // See https://snyk.io/advisor/npm-package/quasar/functions/quasar.Dialog.create
    let buttons = [
      { text: APP._('BUTTON.OK'), onPress: () => {if(on_ok) on_ok()} },
    ];
    if(on_cancel) 
    {
      buttons.unshift({
        text: APP._('BUTTON.CANCEL'),
        onPress: () => { if(on_cancel) on_cancel(); },
        style: 'cancel'
      })
    }
    let options = {
      cancelable: true,
      onDismiss: ()=> { if(on_dismiss) on_dismiss(); }
    }   
    Alert.alert(
        title,
        message,
        buttons,
        options
    ); 
  }

  /**
   * Show a notification popup
   * @param message 
   * @param position 
   * @param timeout 
   */
  static alert = (message: string, is_error: boolean = false, position: | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center" = 'top', timeout=3000) => {    
    this.show_message(message, '');
  }

  static notify = (message: string, is_error: boolean = false, position: | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center" = 'top', timeout=3000) => {    
    if (Platform.OS === 'android') {
      // Use ToastAndroid only on Android platform
      const ToastAndroid = require('react-native').ToastAndroid;
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.CENTER,
        25,
        100,
      );
    } else {
      // Use alert for other platforms
      this.alert(message, is_error, position);
    }
  }

  /**
   * Show error notification
   * @param message 
   * @param position 
   * @param timeout 
   */
  static alert_error = (message: string, position: | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center" = 'bottom', timeout=3000) => {
    this.show_error(message);
  }

  /**
   * Show error notification
   * @param message 
   * @param position 
   * @param timeout 
   */
  static notify_error = (message: string, position: | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center" = 'bottom', timeout=3000) => {
      this.show_error(message);
    }

  /**
   * Show loading icon
   * @param show 
   */
  static toggle_loading = (show: boolean) => {

  }

  /**
   * Transform an object into a new object with new properties or a list of objects into a list of new objects
   * @param src_object Object from whom the new object will be derived
   * @param src_dest_field_map src_field:dest_field dictionary
   */
  static transform = (src_object: object, src_dest_field_map: object) => {
    let src_array = src_object;
    const is_src_array = src_object instanceof Array;
    if (is_src_array === false) {
      src_array = [src_object];
    }
    const dst_array = [];
    src_array.forEach((itm) => {
      const dst = {};
      for (const [key, value] of Object.entries(src_dest_field_map)) {
        dst[value] = itm[key];
      }
      dst_array.push(dst);
    });
    return is_src_array ? dst_array : dst_array[0];
  };

  /**
   * Navigate using standard navigation
   * @param navigator 
   * @param url 
   * @param params 
   * @param query_string 
   */
  static navigate_to_path = (navigation: object, url: string, params: object = {}, query_string: string = '') => { 
    const clone_params = { ...params }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: url,
          params: params,
        },
      ],
    })
  }

  static route_to_path = (
    path: string,
    params: object = {},
    query: object = {}
  ) => {  
    router.push(path)
  };

  static route_to_name = (
    name: string,
    params: object = {},
    queryString = ''
  ) => { 
    router.push({ name: name, params: params, query: queryString })
      .then(() => {
        router.go(0)
      });

      router.replace()
  };

  /**
   * Construct db parameters based on query string values
   * @param queryString
   */
  static make_filters = (queryString: object) => {
    const filters = [];
    for (const key in queryString) {
      filters.push([key, '=', queryString[key]]);
    }
    return filters;
  };

  /**
   * Construct a backend url
   * @param url
   */
  static make_backend_url = (url: string) => {
    return `${this.backendURL}/${url}`;
  };

  static make_frappe_api_endpoint = (endpoint: string, include_custom_app: boolean = true) => {
    if(include_custom_app){
      return `${this.make_backend_url('')}api/method/${APPS.FRAPPE_CUSTOM_APP}.api.${endpoint}`; 
    }
    return `${this.make_backend_url('')}api/method/${endpoint}`; 
  }

  /**
   * Convert File to base64
   * @param file_obj 
   * @returns 
   */
  static file_to_base64 = (file_obj: Blob) => {
    return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = function () {
				resolve(reader.result);
			};
			reader.readAsDataURL(file_obj);
		});
  }

  /**
   * Add leading characters to the value
   * @param val 
   * @param pad_chars
   * @param length 
   */
  static pad_start = (val: string, pad_chars: string, length: number): string => {
    return val.toString().padStart(length, pad_chars);
  }

   /**
   * Add trailing characters to the value
   * @param val 
   * @param pad_chars
   * @param length 
   */
   static pad_end = (val: string, pad_chars: string, length: number): string => {
    return val.toString().padEnd(length, pad_chars);
  }

  /**
   * Update dict values. Similar to Python dict.update
   * @param src 
   * @param dst 
   */
  static update_dict = (src: object, dst: object): object => {
    if(!src) return dst;
    if(!dst) dst = {};
    for(let key in src){
      dst[key] = src[key];
    }
    return dst;
  }

  /**
   * Generate random string
   * See https://www.npmjs.com/package/randomstring
   * @param length 
   * @returns 
   */
  static generate_random_string = (length: number = 6) => {
    return Random.generate(length)
  }

  /**
   * Clip text to the specified length
   * @param str 
   * @param num 
   */
  static clip_text = (str: string, num: number) => { 
      return str?.length > num ? str?.substring(0, num) + '...' : str 
  }  
};
export { APP };