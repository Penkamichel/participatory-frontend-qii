import { APPS, URLS } from '../constants/enums';
import { _ as t } from "../utils/translate";
import { router, useNavigation, useRootNavigationState } from 'expo-router'; 
import { Alert, Platform } from 'react-native';
import * as Random from 'randomstring';   
import { CommonActions, DrawerActions } from '@react-navigation/native';

String.prototype.format = function (...args) {
  return this.replace(/{([0-9]+)}/g, function (match, index) {      
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};

const APP = class AppUtil {
  static backendURL = URLS.BACKEND;

  static get_current_instance() { 
    return null;
  }
 
  static get_full_backend_url(url: string) {
    return AppUtil.backendURL + url;
  }

  static _(text: string, params: object={}) {
    return t(text, params)
  }

  static show_message(
    message: string,
    title: string = '',
  ) {
    if (!title) {
      title = this._('GLOBAL.DEFAULT_INFO_MESSAGE_TITLE');
    }
    this._show_dialog(title, message, null, null, null, false, false);
  }

  static show_error(
    message: string,
    title = '',
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

  static _show_dialog(
    title: string,
    message: string,
    on_ok = null,
    on_cancel = null,
    on_dismiss = null,
    is_error = false,
    is_confirm = false
  ) {
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
      // Use Alert on Android since ToastAndroid is not available in react-native-web
      this.alert(message, is_error, position);
    } else {
      // Use alert for other platforms
      this.alert(message, is_error, position);
    }
  }

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

  static toggle_loading = (show: boolean) => {
  }

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

  static make_filters = (queryString: object) => {
    const filters = [];
    for (const key in queryString) {
      filters.push([key, '=', queryString[key]]);
    }
    return filters;
  };

  static make_backend_url = (url: string) => {
    return `${this.backendURL}/${url}`;
  };

  static make_frappe_api_endpoint = (endpoint: string, include_custom_app: boolean = true) => {
    if(include_custom_app){
      return `${this.make_backend_url('')}api/method/${APPS.FRAPPE_CUSTOM_APP}.api.${endpoint}`; 
    }
    return `${this.make_backend_url('')}api/method/${endpoint}`; 
  }

  static file_to_base64 = (file_obj: Blob) => {
    return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = function () {
				resolve(reader.result);
			};
			reader.readAsDataURL(file_obj);
		});
  }

  static pad_start = (val: string, pad_chars: string, length: number): string => {
    return val.toString().padStart(length, pad_chars);
  }

  static pad_end = (val: string, pad_chars: string, length: number): string => {
    return val.toString().padEnd(length, pad_chars);
  }

  static update_dict = (src: object, dst: object): object => {
    if(!src) return dst;
    if(!dst) dst = {};
    for(let key in src){
      dst[key] = src[key];
    }
    return dst;
  }

  static generate_random_string = (length: number = 6) => {
    return Random.generate(length)
  }

  static clip_text = (str: string, num: number) => { 
      return str?.length > num ? str?.substring(0, num) + '...' : str 
  }  
};
export { APP };