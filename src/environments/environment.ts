// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  app:{
    baseUrl: "https://moloyal.com/",
    path: "test/mosave/adminscript/api/",
    imagePath: "test/mosave/script/api/",
  },
  logo: "../../../assets/img/logo/logo.png",
  logo2: "../../../assets/img/logo/logo2.png",
  logo3: "../../../assets/img/logo/site-logo2.png",
  mini_logo: "../../../assets/img/logo/logo-transparent.png",
  avatar: '../../../assets/img/160x160/img1.jpg',
  emptyTable: './assets/svg/illustrations/oc-error.svg',
  paystack:{
    url: "https://api.paystack.co/",
    secretKey: "sk_live_283e8912e82f34b275a577b97659aec29bf778d1", //"sk_test_feeb3d34498e46330086fe2a73b02692a05adda5",
    publicKey: "pk_test_fb0ce109fe7f1e851ddf454110f04af9b3154e14",
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
