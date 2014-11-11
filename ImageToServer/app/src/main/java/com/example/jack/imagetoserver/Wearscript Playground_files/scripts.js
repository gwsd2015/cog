'use strict';
angular.module('wearscriptPlaygroundApp', [
  'ngResource',
  'ngRoute',
  'ui.ace',
  'angular-table',
  'ui.bootstrap',
  'ui.utils',
  'ngLogging',
  'angular-intro',
  'ui.utils',
  'ja.qr'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/gist/', {
      redirectTo: function (routeParams) {
        return '/';
      }
    }).when('/gist/:gistid', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/gist/:gistid/:file', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).when('/gists', {
      templateUrl: 'views/gists.html',
      controller: 'GistsCtrl'
    }).when('/weariverse', {
      templateUrl: 'views/weariverse.html',
      controller: 'WeariverseCtrl'
    }).when('/images', {
      templateUrl: 'views/images.html',
      controller: 'ImagesCtrl'
    }).when('/sensors', {
      templateUrl: 'views/sensors.html',
      controller: 'SensorsCtrl'
    }).when('/channels', {
      templateUrl: 'views/channels.html',
      controller: 'ChannelsCtrl'
    }).when('/help', {
      templateUrl: 'views/help.html',
      controller: 'HelpCtrl'
    }).when('/logging', {
      templateUrl: 'views/logging.html',
      controller: 'LoggingCtrl'
    }).when('/debug', {
      templateUrl: 'views/debug.html',
      controller: 'DebugCtrl'
    }).when('/annotation', {
      templateUrl: 'views/annotation.html',
      controller: 'AnnotationCtrl'
    }).otherwise({ redirectTo: '/' });
  }
]).run([
  '$log',
  '$http',
  '$window',
  '$location',
  '$rootScope',
  'Socket',
  'Logging',
  'Editor',
  'Profile',
  'Gist',
  function ($log, $http, $window, $location, $rootScope, Socket, Logging, Editor, Profile, Gist) {
    // Globally enable/disable logging
    Logging.enabled = true;
    // Expose profile/path globally for use in templates
    $rootScope.profile = Profile;
    if (window.innerWidth < 400) {
      Profile.menu = false;
    }
    $rootScope.location = $location;
    Socket.connect(window.WSURL + '/ws', function () {
      Gist.init();
    });
    $rootScope.aceLoaded = function (editor) {
      Editor.init(editor);
    };
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('MainCtrl', [
  '$scope',
  'Editor',
  '$routeParams',
  '$location',
  '$timeout',
  '$log',
  function ($scope, Editor, $routeParams, $location, $timeout, $log) {
    // NOTE: If we are changing gists then clear the file state so we use the default procedure
    if ($routeParams.gistid && $routeParams.gistid != Editor.gistid) {
      $log.log('New gist, resetting defaults');
      Editor.file = undefined;
    }
    if (!$routeParams.gistid) {
      $timeout(function () {
        if (Editor.gistid)
          $scope.$apply($location.path('/gist/' + Editor.gistid + '/' + Editor.file));
        else
          $scope.$apply($location.path('/gist/11069552/glass.html'));
      });
      return;
    }
    if (!$routeParams.file) {
      $timeout(function () {
        if (Editor.file)
          $scope.$apply($location.path('/gist/' + $routeParams.gistid + '/' + Editor.file));
        else
          $scope.$apply($location.path('/gist/' + $routeParams.gistid + '/glass.html'));
      });
      return;
    }
    Editor.gistid = $routeParams.gistid;
    Editor.file = $routeParams.file;
    $scope.editor = Editor;
    $scope.editorActive = Editor.active;
    Editor.update();
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('EditorCtrl', [
  '$scope',
  '$http',
  'Profile',
  function ($scope, $http, Profile) {
    $scope.vimval = Profile.get('vim_mode');
    $scope.vimMode = function () {
      Profile.set('vim_mode', $scope.vimval);
    };
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('GistsCtrl', [
  '$scope',
  'Gist',
  'Socket',
  '$rootScope',
  '$log',
  '$filter',
  '$http',
  function ($scope, Gist, Socket, $rootScope, $log, $filter, $http) {
    $scope.gists = [];
    Gist.list(function () {
      $scope.gists = $filter('orderBy')(Gist.gists, 'updated_at', true);
      $scope.$apply();
    });
    $scope.wear = function (gist) {
      Gist.get(gist.id, function (channel, data) {
        var files = {};
        for (var key in data.files) {
          if (data.files.hasOwnProperty(key))
            files[key] = data.files[key].content;
        }
        // TODO(brandyn): Legacy
        Socket.ws.publish('glass', 'script', files);
        Socket.ws.publish('android', 'script', files);
      });
    };
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('WeariverseCtrl', [
  '$scope',
  'Storage',
  'Gist',
  'Socket',
  '$rootScope',
  '$log',
  '$window',
  function ($scope, Storage, Gist, Socket, $rootScope, $log, $window) {
    function gistList(channel, gists) {
      console.log('Got weariverse gists');
      $window.HACK_WEAR = gists;
      if (typeof gists == 'object') {
        for (var i = 0; i < gists.length; i++)
          gists[i].url_playground = '#/gist/' + gists[i].id;
        $scope.gists = gists;
        $scope.$apply();
      }
    }
    var ws = Socket.ws;
    var channel = ws.channel(ws.groupDevice, 'weariverseList');
    ws.publish_retry(gistList.bind(this), 1000, channel, 'weariverse', 'list', channel);
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('ImagesCtrl', [
  '$scope',
  '$window',
  'Socket',
  function ($scope, $window, Socket) {
    var ws = Socket.ws;
    $scope.images = {};
    // [device] = imageb64
    function image_cb(channel, time, imageData) {
      $scope.images[channel] = {
        'url': 'data:image/jpeg;base64,' + btoa(imageData),
        'time': time,
        'channel': channel
      };
      $scope.$apply();  // HACK(brandyn): Not sure why we have to do this
    }
    ws.subscribe('image', image_cb);
    $scope.$on('$destroy', function cleanup() {
      ws.unsubscribe('image');
    });
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('SensorsCtrl', [
  '$scope',
  '$window',
  'Socket',
  function ($scope, $window, Socket) {
    var ws = Socket.ws;
    $scope.sensors = {};
    $scope.cubeShow = false;
    // NOTE(brandyn): All of this cube code should eventually be moved to a library or something
    this.cubeMatrix = function (values) {
      var mat = this.remap_coordinate_system(this.getRotationMatrixFromVector(values), 1, 3);
      mat = this.remap_coordinate_system(this.transpose_matrix(mat), 3, 1);
      $scope.cubeMatrix = $scope.cubeMatrixStyle = {
        'transform': 'matrix3d(' + mat.join(',') + ')',
        '-webkit-transform': 'matrix3d(' + mat.join(',') + ')',
        'transition-duration': '0s'
      };
    };
    this.getRotationMatrixFromVector = function (rotationVector) {
      var q0;
      var q1 = rotationVector[0];
      var q2 = rotationVector[1];
      var q3 = rotationVector[2];
      var R = new Array(16);
      if (rotationVector.length == 4) {
        q0 = rotationVector[3];
      } else {
        q0 = 1 - q1 * q1 - q2 * q2 - q3 * q3;
        q0 = q0 > 0 ? Math.sqrt(q0) : 0;
      }
      var sq_q1 = 2 * q1 * q1;
      var sq_q2 = 2 * q2 * q2;
      var sq_q3 = 2 * q3 * q3;
      var q1_q2 = 2 * q1 * q2;
      var q3_q0 = 2 * q3 * q0;
      var q1_q3 = 2 * q1 * q3;
      var q2_q0 = 2 * q2 * q0;
      var q2_q3 = 2 * q2 * q3;
      var q1_q0 = 2 * q1 * q0;
      R[0] = 1 - sq_q2 - sq_q3;
      R[1] = q1_q2 - q3_q0;
      R[2] = q1_q3 + q2_q0;
      R[3] = 0;
      R[4] = q1_q2 + q3_q0;
      R[5] = 1 - sq_q1 - sq_q3;
      R[6] = q2_q3 - q1_q0;
      R[7] = 0;
      R[8] = q1_q3 - q2_q0;
      R[9] = q2_q3 + q1_q0;
      R[10] = 1 - sq_q1 - sq_q2;
      R[11] = 0;
      R[12] = R[13] = R[14] = 0;
      R[15] = 1;
      return R;
    };
    this.remap_coordinate_system = function (inR, X, Y) {
      // AXIS_X=1, AXIS_Y=2, AXIS_Z=3
      /*
           * X and Y define a rotation matrix 'r':
           *
           *  (X==1)?((X&0x80)?-1:1):0    (X==2)?((X&0x80)?-1:1):0    (X==3)?((X&0x80)?-1:1):0
           *  (Y==1)?((Y&0x80)?-1:1):0    (Y==2)?((Y&0x80)?-1:1):0    (Y==3)?((X&0x80)?-1:1):0
           *                              r[0] ^ r[1]
           *
           * where the 3rd line is the vector product of the first 2 lines
           *
           */
      var outR = new Array(16);
      var length = outR.length;
      if (inR.length != length)
        return;
      // invalid parameter
      if ((X & 124) != 0 || (Y & 124) != 0)
        return;
      // invalid parameter
      if ((X & 3) == 0 || (Y & 3) == 0)
        return;
      // no axis specified
      if ((X & 3) == (Y & 3))
        return;
      // same axis specified
      // Z is "the other" axis, its sign is either +/- sign(X)*sign(Y)
      // this can be calculated by exclusive-or'ing X and Y; except for
      // the sign inversion (+/-) which is calculated below.
      var Z = X ^ Y;
      // extract the axis (remove the sign), offset in the range 0 to 2.
      var x = (X & 3) - 1;
      var y = (Y & 3) - 1;
      var z = (Z & 3) - 1;
      // compute the sign of Z (whether it needs to be inverted)
      var axis_y = (z + 1) % 3;
      var axis_z = (z + 2) % 3;
      if ((x ^ axis_y | y ^ axis_z) != 0)
        Z ^= 128;
      var sx = X >= 128;
      var sy = Y >= 128;
      var sz = Z >= 128;
      // Perform R * r, in avoiding actual muls and adds.
      var rowLength = length == 16 ? 4 : 3;
      for (var j = 0; j < 3; j++) {
        var offset = j * rowLength;
        for (var i = 0; i < 3; i++) {
          if (x == i)
            outR[offset + i] = sx ? -inR[offset + 0] : inR[offset + 0];
          if (y == i)
            outR[offset + i] = sy ? -inR[offset + 1] : inR[offset + 1];
          if (z == i)
            outR[offset + i] = sz ? -inR[offset + 2] : inR[offset + 2];
        }
      }
      if (length == 16) {
        outR[3] = outR[7] = outR[11] = outR[12] = outR[13] = outR[14] = 0;
        outR[15] = 1;
      }
      return outR;
    };
    this.transpose_matrix = function (mat) {
      var mat_trans = [];
      for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++)
          mat_trans.push(mat[j * 4 + i]);
      return mat_trans;
    };
    this.sensors_cb = function (channel, sensorTypes, sensorValues) {
      if (!$scope.sensors.hasOwnProperty(channel))
        $scope.sensors[channel] = { sensors: {} };
      for (var key in sensorValues)
        if (sensorValues.hasOwnProperty(key)) {
          var values = sensorValues[key];
          var value = values[values.length - 1];
          var d = new Date(0);
          if (key === 'MPL Rotation Vector') {
            $scope.sensors[channel].cubeMatrixStyle = this.cubeMatrix(value[0]);
            $scope.cubeShow = true;
          }
          d.setUTCSeconds(value[1]);
          value[1] = [
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
          ].join(':');
          $scope.sensors[channel].sensors[key] = value;
        }
      //console.log('applying: ' + JSON.stringify($scope.sensors));
      $scope.$apply();  // HACK(brandyn): Not sure why we have to do this
    }.bind(this);
    ws.subscribe('sensors', this.sensors_cb);
    $scope.$on('$destroy', function cleanup() {
      ws.unsubscribe('sensors');
    });
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('ChannelsCtrl', [
  '$scope',
  'Socket',
  function ($scope, Socket) {
    var ws = Socket.ws;
    var channels = ws.channelsExternal();
    var channelsOut = [];
    for (var i in channels) {
      if (channels.hasOwnProperty(i)) {
        channelsOut.push({
          'device': i,
          'channels': channels[i].join(' ')
        });
      }
    }
    $scope.nameList = channelsOut;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('SetupCtrl', [
  '$scope',
  '$http',
  'Profile',
  '$modalInstance',
  function ($scope, $http, Profile, $modalInstance) {
    $scope.wsurl = '';
    $scope.adb = '';
    $scope.imageHeight = '0px';
    $scope.qrshow = false;
    $scope.qr = function () {
      $http.post('user/key/ws').success(function (wskey) {
        var wsurl = WSURL + '/ws/' + wskey;
        $scope.wsurl = wsurl;
        $scope.adb = 'adb shell "mkdir -p /sdcard/wearscript && echo \'' + wsurl + '\' > /sdcard/wearscript/qr.txt"';
        if (window.innerWidth < 400) {
          $scope.imageHeight = '250px';
        } else {
          $scope.imageHeight = '500px';
        }
        $scope.qrshow = true;
        $scope.apply();
      });
    };
    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('HelpCtrl', [
  '$scope',
  '$window',
  function ($scope, $window) {
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('ModalCtrl', [
  '$scope',
  '$modal',
  '$log',
  '$route',
  'Logging',
  function ($scope, $modal, $log, $route, Logging) {
    $scope.logs = Logging.logs;
    $scope.generalSettingsUrl = '/views/modals/settings/generalSettings.html';
    $scope.shortcuts = [
      {
        description: 'Run Script',
        command: 'Ctrl+Enter (Cmd+Enter for OSX)'
      },
      {
        description: 'Run Line/Selection',
        command: 'Alt+Enter'
      },
      {
        description: 'Wake Display',
        command: 'Shift+Enter'
      },
      {
        description: 'Save to Gist',
        command: 'Ctrl+S (Cmd+S for OSX)'
      },
      {
        description: 'Save to New Gist',
        command: 'Ctrl+Shift+S (Cmd+Shift+S for OSX)'
      }
    ];
    $scope.open = function (currentModal) {
      var modalTemplate = '';
      var controller = '';
      switch (currentModal) {
      case 'shortcuts':
        modalTemplate = 'views/modals/shortcuts.html';
        break;
      case 'save-gist':
        modalTemplate = 'views/modals/save-gist.html';
        break;
      case 'setup':
        modalTemplate = 'views/modals/setup.html';
        controller = 'SetupCtrl';
        break;
      case 'fileManager':
        modalTemplate = 'views/modals/fileManager.html';
        controller = 'FileManagerCtrl';
        break;
      case 'settings':
        settingsModal();
        break;
      case 'connected':
        modalTemplate = 'views/modals/connectedmodal.html';
        break;
      default:
        modalTemplate = 'views/modals/help.html';
        break;
      }
      var modalInstance = $modal.open({
          templateUrl: modalTemplate,
          controller: controller != '' ? controller : ModalInstanceCtrl,
          resolve: {
            shortcuts: function () {
              return $scope.shortcuts;
            },
            ok: function () {
              return $scope.ok;
            }
          }
        });
      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
      /**
       * @title SettingsModal
       * Different settings for the current pages settings. Will get very large, but
       * for now, it is purely for routing different pages settings. No other logic.
       *
       * @return {NILL}
       */
      function settingsModal() {
        var url = $route.current.$$route.originalPath;
        if (url === '/') {
          modalTemplate = 'views/modals/settings/editorSettings.html';
        } else if (url === '/gists') {
          modalTemplate = 'views/modals/settings/gistSettings.html';
        } else if (url === '/images') {
          modalTemplate = 'views/modals/settings/imageSettings.html';
        } else if (url === '/sensors') {
          modalTemplate = 'views/modals/settings/sensorSettings.html';
        } else if (url === '/channels') {
          modalTemplate = 'views/modals/settings/channelSettings.html';
        } else if (url === '/logging') {
          modalTemplate = 'views/modals/settings/loggingSettings.html';
        } else {
          modalTemplate = 'views/modals/help.html';
        }
      }
      ;
    };
    /**
     * @title saveToGist
     * button click to save current code to gist
     * should change the modal view to a spinner modal
     * spins until $broadcast (confirmed saved to gist)
     * when confirmed saved, return to editor setting modal
     * @return {NILL}
     */
    $scope.saveToGist = function () {
      // modalTemplate = '*TODO*'
      console.log('Save to Gists: ', 'A modal should pop up!');
    };
    /**
     * @title saveToGlass
     * button click to save current code to glass
     change the modal view to a spinner modal
     * spins until $broadcast (confirmed saved to glass)
     * when confirmed saved, return to editor setting modal
     * @return {NILL}
     */
    $scope.saveToGlass = function () {
      // modalTemplate = '*TODO*'
      console.log('Save to Glass: ', 'A modal should pop up!');
    };
  }
]);
var ModalInstanceCtrl = function ($scope, $modalInstance, shortcuts) {
  $scope.shortcuts = shortcuts;
  $scope.selected = { shortcut: $scope.shortcuts[0] };
  $scope.ok = function () {
    $modalInstance.close($scope.selected.shotrcut);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
/*
///////////////////////
I made the shortcuts work but I wasn't sure how you wanted to
organize this controler so I left all of the old code here.
///////////////////////
'use strict';

angular.module('wearscriptPlaygroundApp')
  .controller('ModalCtrl', function ($scope, $modal, $log) {
    $scope.items = ['Run Script', 'Run Line/Selection', 'Save to Gist'];

    $scope.open = function (currentModal) {

      var modalTemplate = '';
      switch(currentModal){
        case undefined:
        case '':
          modalTemplate = 'views/modals/help.html'
          console.log(modalTemplate);
          break;
        case 'help':
          modalTemplate = 'views/modals/help.html'
          break;
        case 'shortcuts':
          modalTemplate = 'views/modals/shortcuts.html'
          break;
        case 'save-gist':
          modalTemplate = 'views/modals/save-gist.html'
          break
      }
      var modalInstance = $modal.open({
        templateUrl: modalTemplate,
        controller: ModalInstanceCtrl,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  });

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
      item: $scope.items[0]
    };

    $scope.ok = function () {
      $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
};
*/
'use strict';
angular.module('wearscriptPlaygroundApp').controller('AnnotationCtrl', [
  '$scope',
  'Socket',
  function ($scope, Socket) {
    var ws = Socket.ws;
    $scope.images = {};
    // [device] = imageb64
    this.canvas = document.querySelector('#canvas');
    this.context = this.canvas.getContext('2d');
    this.pointCount = -1;
    this.points = [];
    this.response = '';
    this.initCanvas = function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var tool = {};
      function ev_canvas(ev) {
        if (ev.layerX || ev.layerX == 0) {
          // Firefox
          ev._x = ev.layerX;
          ev._y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) {
          // Opera
          ev._x = ev.offsetX;
          ev._y = ev.offsetY;
        }
        var evtype = ev.type;
        if (evtype.slice(0, 5) == 'touch' && event.touches.length == 1) {
          console.log('Touch');
          ev._x = ev.touches[0].pageX;
          ev._y = ev.touches[0].pageY;
        }
        console.log(ev._x + ' ' + ev._y);
        var func = tool[evtype];
        if (func) {
          func(ev);
        }
      }
      this.canvas.addEventListener('mousedown', ev_canvas, false);
      this.canvas.addEventListener('mousemove', ev_canvas, false);
      this.canvas.addEventListener('mouseup', ev_canvas, false);
      this.canvas.addEventListener('touchmove', ev_canvas, false);
      this.canvas.addEventListener('touchstart', ev_canvas, false);
      this.canvas.addEventListener('touchend', ev_canvas, false);
      tool.mousemove = function (ev) {
      };
      tool.mousedown = function (ev) {
        if (this.pointCount > 0) {
          this.points.push([
            ev._x,
            ev._y
          ]);
          if (this.points.length == this.pointCount) {
            this.pointCount = -1;
            ws.publish(this.response, this.points);
            this.points = [];
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }
        }
        this.context.beginPath();
        this.context.arc(ev._x, ev._y, 50, 0, 2 * Math.PI);
        this.context.strokeStyle = '#0b61a4';
        this.context.stroke();
      }.bind(this);
      tool.mouseup = function (ev) {
      };
      tool.touchmove = function (ev) {
      };
      tool.touchstart = function (ev) {
      };
      tool.touchend = function (ev) {
      };
    };
    this.initCanvas();
    this.image_cb = function (channel, response, imageData, numPoints, description) {
      this.pointCount = numPoints;
      this.points = [];
      this.response = response;
      var image = new Image();
      console.log(channel);
      image.onload = function (image_id) {
        this.context.drawImage(image, 0, 0);
        console.log('Height: ' + image.naturalHeight + ' Width: ' + image.naturalWidth);
      }.bind(this);
      image.src = 'data:image/jpeg;base64,' + imageData;
      console.log(image.src.length);
      document.querySelector('#canvas');
      $scope.description = description;
      $scope.$apply();  // HACK(brandyn): Not sure why we have to do this
    }.bind(this);
    ws.subscribe('annotationimagepoints', this.image_cb);
    $scope.$on('$destroy', function cleanup() {
      ws.unsubscribe('image');
    });
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('LoggingCtrl', [
  '$scope',
  'Logging',
  function ($scope, Logging) {
    $scope.logs = Logging.ws;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('HeaderCtrl', [
  '$scope',
  'Editor',
  function ($scope, Editor) {
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('DebugCtrl', [
  '$scope',
  'Logging',
  function ($scope, Logging) {
    console.log(Logging.logs);
    $scope.debug = Logging.logs;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('MenuCtrl', [
  '$scope',
  '$log',
  'Profile',
  function ($scope, $log, Profile) {
  }
]);
/**
 * # HTML5 localStorage management service
 *
 * Allows for storing and recalling data from localStorage prefixed with an
 * application specific key. Also handles object stringification and
 * de-stringification as needed
 *
 * Examples:
 *
 *     storageService.set('somekey','somevalue')
 *     storageService.set('somekey',{'key':'value'})
 *     var storedKey = storageService.get('somekey')
 *
 */
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Storage', [
  '$log',
  function ($log) {
    var storage = {
        data: {},
        storage_id: 'WS_',
        get: function (key) {
          var data, result;
          try {
            data = localStorage.getItem(this.storage_id + key);
          } catch (e) {
          }
          try {
            result = JSON.parse(data);
          } catch (e) {
            result = data;
          }
          //$log.info('>> storageService',key,result);
          return result;
        },
        set: function (key, data) {
          if (typeof data == 'object') {
            data = JSON.stringify(data);
          }
          try {
            localStorage.setItem(this.storage_id + key, data);  //$log.info('<< storageService',key,data);
          } catch (e) {
            $log.error('!! storageService', e);
          }
        },
        remove: function (key) {
          try {
            var status = localStorage.removeItem(this.storage_id + key);
            $log.info('-- storageService', key);
            return status;
          } catch (e) {
            $log.error('!! storageService', e);
            return false;
          }
        }
      };
    return storage;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Socket', [
  '$log',
  '$window',
  'Profile',
  '$rootScope',
  'Logging',
  function ($log, $window, Profile, $rootScope, Logging) {
    var service = {
        ws: {},
        deviceCount: 0,
        connected: false,
        devices: [{
            name: 'glass',
            connected: false
          }]
      };
    function onopen() {
      $log.info('** Socket', 'Server Connected');
      $rootScope.$broadcast('connected');
      service.connected = true;
      function log_cb(channel, message) {
        Logging.ws = Logging.ws || [];
        if (Logging.ws.length > 1000) {
          Logging.ws.pop();
        }
        if (channel.indexOf('log') != -1) {
          var log = {};
          log.type = 'log';
          log.message = message;
          Logging.ws.unshift(log);
        }
        $log.info(channel + ' : ' + message);  // TODO(brandyn): Have a notification that a log message was sent
      }
      function urlopen_cb(channel, url) {
        $window.open(url);
      }
      function subscription_cb(foo) {
        $rootScope.$broadcast('subscription');
        if (service.ws.exists('glass')) {
          $log.info('** Socket', 'Glass Connected');
          $rootScope.$broadcast('glass');
          angular.forEach(service.devices, function (k) {
            if (k.name == 'glass')
              k.connected = true;
          });
          $rootScope.$apply();
        } else {
          $log.warn('!! Socket', 'Glass Disconnected');
          angular.forEach(service.devices, function (k) {
            if (k.name == 'glass')
              k.connected = false;
          });
        }
        service.counter();
      }
      service.ws.subscribeTestHandler();
      service.ws.subscribe('subscriptions', subscription_cb);
      service.ws.subscribe('log', log_cb);
      service.ws.subscribe('urlopen', urlopen_cb);
    }
    service.connect = function (url, callback) {
      service.socket = new ReconnectingWebSocket(url);
      service.socket.onclose = function () {
        service.connected = false;
        $log.error('!! Socket', 'Server Disconnected');
      };
      var connect = service.connect;
      service.ws = new WearScriptConnection(service.socket, 'playground', Math.floor(Math.random() * 100000), function () {
        onopen();
        callback();
      });
    };
    service.counter = function () {
      service.deviceCount = 0;
      angular.forEach(service.devices, function (k) {
        if (k.connected == true)
          service.deviceCount++;
      });
    };
    return service;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Editor', [
  '$modal',
  '$window',
  '$rootScope',
  '$log',
  '$http',
  '$routeParams',
  '$timeout',
  '$location',
  'Socket',
  'Gist',
  'Profile',
  'Playground',
  'Storage',
  function ($modal, $window, $rootScope, $log, $http, $routeParams, $timeout, $location, Socket, Gist, Profile, Playground, Storage) {
    ace.config.set('basePath', 'bower_components/ace-builds/src-min-noconflict');
    var service = {
        dirty: false,
        content: '',
        gistid: undefined,
        file: undefined,
        forkonsave: false,
        session: false,
        menu: true,
        status: ''
      };
    service.update = function () {
      $log.log('editor service updated');
      if (Gist.activeGist && Gist.activeGist.id == $routeParams.gistid)
        return;
      if (!$routeParams.gistid || !$routeParams.file) {
        $log.log('not updating as gistid/file is undefined in routeParams');
        return;
      }
      if (service.session)
        service.session.setValue('');
      Gist.get($routeParams.gistid, function gist_cb(channel, serverGist) {
        if (typeof serverGist === 'string') {
          service.status = 'Error: Unable to get gist: #' + $routeParams.gistid + '. If the problem persists try to re-auth github (click the gears icon).';
          $rootScope.$apply();
          return;
        }
        Gist.refresh(serverGist);
        var file = $routeParams.file;
        if (!serverGist.files[file])
          serverGist.files[file] = { content: '' };
        var content = serverGist.files[file].content;
        service.session.setValue(content);
        service.status = 'Loaded: #' + $routeParams.gistid + '/' + $routeParams.file;
        $rootScope.$apply();
      }.bind(this));
    };
    service.saveCreate = function (editor) {
      $modal.open({
        templateUrl: 'views/modals/save-gist.html',
        controller: function ($scope, $modalInstance) {
          $scope.file = {};
          $scope.ok = function (file) {
            $modalInstance.close(file);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss();
          };
        }
      }).result.then(function (file) {
        $log.log(JSON.stringify(Gist.activeGist.files));
        Gist.create(!file.private, '[wearscript] ' + file.description, Gist.activeGist.files, function (x, y) {
          if (typeof y === 'string') {
            $log.log('Got error from gist create: ' + y);
            // TODO(brandyn): 1. Check if we can tell that it's not this user's gist, 2. check if the user is authorized
            service.status = 'Error: Unable to create gist.  1.) Are you authorized? or 2.) Is github down?.';
            $rootScope.$apply();
            return;
          }
          if (y && y.id) {
            service.status = 'Created: #' + y.id;
            $rootScope.$apply();
            Gist.refresh(y);
            $location.path('/gist/' + y.id);
          }
        });
      });
    };
    service.saveFork = function (editor) {
      var gist = Gist.activeGist;
      Gist.fork($routeParams.gistid, function (x, gist) {
        if (gist.id) {
          Gist.modify(gist.id, gist.files, function (x, gist) {
            if (typeof gist === 'string') {
              $log.log('Got error from fork: ' + gist);
              // TODO(brandyn): 1. Check if we can tell that it's not this user's gist, 2. check if the user is authorized
              service.status = 'Error: Unable to fork gist.';
              $rootScope.$apply();
              return;
            }
            service.status = 'Forked: #' + gist.id + '/' + $routeParams.file;
            Gist.refresh(gist);
            $location.path('/gist/' + gist.id);
            $rootScope.$apply();
          });
        }
      });
    };
    service.saveModify = function (editor) {
      var gist = Gist.activeGist;
      Gist.modify(gist.id, gist.files, function (x, modGist) {
        if (typeof modGist === 'string') {
          $log.log('Got error from modify: ' + modGist);
          // TODO(brandyn): 1. Check if we can tell that it's not this user's gist, 2. check if the user is authorized
          service.status = 'Error: Unable to write gist.  If this is someone else\'s gist use Ctrl+Shift+S to \'save as\'.';
          $rootScope.$apply();
          return;
        }
        Gist.refresh(modGist);
        service.status = 'Saved: #' + $routeParams.gistid + '/' + $routeParams.file;
        $rootScope.$apply();
      });
    };
    service.init = function (editor) {
      $log.log('editor service constructed');
      service.editor = editor;
      service.session = editor.session;
      //service.editor.setReadOnly(false);
      if (Profile.get('vim_mode')) {
        service.editor.setKeyboardHandler('ace/keyboard/vim');
      }
      var gist = Gist.activeGist;
      var content = false;
      if (gist && gist.files && gist.files[$routeParams.file] && gist.files[$routeParams.file].content) {
        var content = gist.files[$routeParams.file].content;
      }
      if (!content) {
        service.update();
      } else {
        service.session.setValue(content);
      }
      service.editor.getSession().on('change', function (e) {
        service.dirty = true;
        if (Gist.activeGist && Gist.activeGist.files[$routeParams.file]) {
          Gist.activeGist.files[$routeParams.file].content = service.editor.getValue();
        }
      });
      service.editor.commands.addCommand({
        name: 'wake-screen',
        bindKey: {
          win: 'Shift-Enter',
          mac: 'Shift-Enter'
        },
        exec: function (editor) {
          // NOTE(brandyn): Legacy
          Socket.ws.publish('glass', 'lambda', 'WS.wake();WS.activityCreate();');
          Socket.ws.publish('android', 'lambda', 'WS.wake();WS.activityCreate();');
          service.status = 'Woke Glass Screen';
          $rootScope.$apply();
        }
      });
      service.editor.commands.addCommand({
        name: 'evaluate-editor',
        bindKey: {
          win: 'Ctrl-Enter',
          mac: 'Command-Enter'
        },
        exec: function (editor) {
          var filesForGlass = {};
          var gist = Gist.activeGist;
          // BUG: Sends old data
          angular.forEach(gist.files, function (file, fileName) {
            filesForGlass[fileName] = file.content;
          });
          Socket.ws.publish('glass', 'script', filesForGlass);
          Socket.ws.publish('android', 'script', filesForGlass);
          service.status = 'Sent project to Glass';
          $rootScope.$apply();
        }
      });
      service.editor.commands.addCommand({
        name: 'save-editor',
        bindKey: {
          win: 'Ctrl-S',
          mac: 'Command-S'
        },
        sender: 'editor|cli',
        exec: function (editor) {
          $log.log(JSON.stringify($routeParams));
          var gist = Gist.activeGist;
          $log.log(JSON.stringify(gist));
          $log.log(JSON.stringify(Profile));
          if (true || gist.user && gist.owner.id == Profile.github_user.id) {
            service.saveModify(editor);
          } else {
            service.saveCreate(editor);
          }
        }
      });
      service.editor.commands.addCommand({
        name: 'saveas-editor',
        bindKey: {
          win: 'Ctrl-Shift-S',
          mac: 'Command-Shift-S'
        },
        exec: service.saveCreate
      });
      service.editor.commands.addCommand({
        name: 'evaluate-region',
        bindKey: {
          win: 'Alt-Enter',
          mac: 'Alt-Enter'
        },
        exec: function (editor) {
          var line = service.editor.session.getTextRange(service.editor.getSelectionRange());
          if (!line.length) {
            line = service.editor.session.getLine(service.editor.selection.getCursor().row);
          }
          // NOTE(brandyn): Legacy
          Socket.ws.publish('glass', 'lambda', line);
          Socket.ws.publish('android', 'lambda', line);
          service.status = 'Executed Current Line';
          $rootScope.$apply();
        }
      });
    };
    return service;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Profile', [
  'Storage',
  '$rootScope',
  function (Storage, $rootScope) {
    var profile = {
        authenticated: false,
        complete: false,
        github_user: {},
        google_user: false,
        glass_id: false,
        vim_mode: Storage.get('vim_mode') || false,
        debug_mode: Storage.get('debug_mode') || false,
        menu: Storage.get('menu') || true,
        set: function (key, val) {
          this[key] = val;
          Storage.set(key, val);
        },
        get: function (key) {
          return this[key] || Storage.get(key);
        },
        toggle: function (key) {
          this[key] = !this[key];
          Storage.set(key, this[key]);
          return this[key];
        }
      };
    return profile;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Playground', [
  '$log',
  '$rootScope',
  '$location',
  'Socket',
  'Profile',
  function ($log, $rootScope, $location, Socket, Profile) {
    var service = {};
    service.redirectAuthGoogle = function () {
      $location.replace('auth');
    };
    service.redirectAuthGithub = function () {
      $location.replace('authgh');
    };
    service.redirectSignout = function () {
      $location.replace('signout');
    };
    service.createKey = function (type, success, error) {
      var xhr = $.ajax({
          url: 'user/key/' + type,
          type: 'POST',
          success: success
        });
      if (!_.isUndefined(error)) {
        xhr.error(error);
      }
    };
    service.createQR = function (WSUrl, success, error) {
      service.createKey('ws', function (secret) {
        success('https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=' + WSUrl + '/ws/' + secret + '&chld=H|4&choe=UTF-8');
      }, error);
    };
    return service;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('FileManagerCtrl', [
  '$scope',
  'Gist',
  '$modalInstance',
  '$routeParams',
  '$location',
  'Playground',
  'Socket',
  'Editor',
  'Storage',
  function ($scope, Gist, $modalInstance, $routeParams, $location, Playground, Socket, Editor, Storage) {
    var ws = Socket.ws;
    var gists = Gist.gists;
    var currentFile = $routeParams.file || '';
    $scope.availableFiles = [];
    $scope.gistName = '';
    $scope.newFileName = '';
    $scope.fileSelected = '';
    var gistid = $routeParams.gistid;
    var gist = Gist.activeGist;
    $scope.availableFiles = Object.keys(gist.files);
    $scope.openFile = function ($event) {
      $scope.fileSelected = openFileForm.fileSelected.value;
      if (typeof $event != 'undefined')
        $event.preventDefault();
      if (typeof $scope.fileSelected == 'undefined' || $scope.fileSelected == '') {
        openFileForm.fileSelected.$error = true;
      } else {
        $location.path('/gist/' + $routeParams.gistid + '/' + $scope.fileSelected);
        $scope.ok();
      }
    };
    $scope.newFile = function ($event) {
      var fileName = newFileForm.newFileName.value;
      if (typeof $event != 'undefined')
        $event.preventDefault();
      if (!Gist.activeGist.files[fileName])
        Gist.activeGist.files[fileName] = { content: '' };
      $modalInstance.dismiss('cancel');
      $location.path('/gist/' + $routeParams.gistid + '/' + fileName);
    };
    $scope.newGist = function () {
    };
    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').factory('Gist', [
  '$log',
  '$http',
  '$window',
  'Storage',
  'Socket',
  'Profile',
  function ($log, $http, $window, Storage, Socket, Profile) {
    var service = {
        gists: [],
        activeGist: undefined
      };
    service.list = function (callback) {
      var ws = Socket.ws;
      var channel = ws.channel(ws.groupDevice, 'gistList');
      ws.publish_retry(function (channel, gists) {
        if (typeof gists === 'string') {
          service.status = 'Error: Unable to list gists, if the problem persists try to re-auth github (click the gears icon).';
          $rootScope.$apply();
          return;
        }
        if (typeof gists == 'object') {
          for (var i = 0; i < gists.length; i++)
            gists[i].url_playground = '#/gist/' + gists[i].id;
          Storage.set('gists', gists);
          service.gists = gists;
          Profile.set('github_user', gists[0].owner);
          if (typeof callback == 'function') {
            callback.call(this);
          }
        }
      }.bind(this), 1000, channel, 'gist', 'list', channel);
    };
    service.get = function (id, callback) {
      var channel = Socket.ws.channel(Socket.ws.groupDevice, 'gistGet');
      $log.info('<< Gist', 'get', id);
      Socket.ws.publish_retry(callback, 1000, channel, 'gist', 'get', channel, id);
    };
    service.getLocal = function (id) {
      for (var idx in service.gists) {
        var gist = service.gists[idx];
        if (gist.id == id)
          return gist;
      }
    };
    service.setLocal = function (id, file, content) {
      var update = false;
      angular.forEach(service.gists, function (gist) {
        if (gist.id == id) {
          if (!gist.files[file])
            gist.files[file] = {};
          gist.files[file].content = content;
          update = true;
        }
      });
      if (!update) {
        var gist = {
            'id': id,
            'files': {}
          };
        gist.files[file] = { 'content': content };
        service.gists.push(gist);
      }
    };
    service.modify = function (id, files, callback) {
      $log.info('<< Gist', 'modify', id, files);
      var channel = Socket.ws.channel(Socket.ws.groupDevice, 'gistModify');
      Socket.ws.subscribe(channel, callback);
      angular.forEach(files, function (file) {
        angular.forEach(file, function (value, prop) {
          if (prop != 'content') {
            delete file[prop];
          }
        });
      });
      Socket.ws.publish('gist', 'modify', channel, id, undefined, files);
    };
    service.create = function (secret, description, files, callback) {
      $log.info('<< Gist', 'create', description, files);
      var channel = Socket.ws.channel(Socket.ws.groupDevice, 'gistCreate');
      Socket.ws.subscribe(channel, callback);
      Socket.ws.publish('gist', 'create', channel, secret, description, files);
    };
    service.fork = function (id, callback) {
      $log.info('<< Gist', 'fork', id);
      var channel = Socket.ws.channel(Socket.ws.groupDevice, 'gistFork');
      Socket.ws.subscribe(channel, callback);
      Socket.ws.publish('gist', 'fork', channel, id);
    };
    service.refresh = function (gist) {
      $log.info('** Gist', 'refresh', gist);
      service.activeGist = gist;
      $window.HACK_ACTIVE = service.activeGist;
    };
    service.init = function () {
      service.list();
    };
    return service;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('ConnectedCtrl', [
  '$scope',
  'Socket',
  function ($scope, Socket) {
    $scope.socket = Socket;
  }
]);
'use strict';
angular.module('wearscriptPlaygroundApp').controller('TourCtrl', [
  '$scope',
  '$timeout',
  function ($scope, $timeout) {
    $scope.nextLabel = 'next';
    $scope.onBeforeChangeEvent = function (element) {
      console.log('Before Change Event called');
      //console.log($scope.intro)
      var eID = element.id;
      switch (eID) {
      case 'menu-toggle':
        //$scope.IntroOptions.nextLabel = "hi";
        /*
            element.onclick = function(event){
              document.querySelector('.introjs-nextbutton').click();
              console.log('you set an event listener')
              $scope.nextLabel = 'good job';
            }
            //introJs(4).setOption("nextLable", "swag").start()
            break;
          case "shortcuts-button":
            $scope.$on('modal-shown', function() {

            });
            */
        break;
      case 'editor-tab':
        break;
      case 'gists-tab':
        break;
      case 'images-tab':
        break;
      case 'sensors-tab':
        break;
      case 'channels-tab':
        break;
      case 'logging-tab':
        break;
      case 'annotation-tab':
        break;
      case 'weariverse-tab':
        break;
      }
    };
    $scope.onChangeEvent = function (element) {
      console.log('Change Event called');
      var eID = element.id;
      switch (eID) {
      case 'menu-toggle':
        break;
      case 'editor-tab':
        break;
      case 'gists-tab':
        break;
      case 'images-tab':
        break;
      case 'sensors-tab':
        break;
      case 'channels-tab':
        break;
      case 'logging-tab':
        break;
      case 'annotation-tab':
        break;
      case 'weariverse-tab':
        break;
      }
    };
    $scope.onAfterChangeEvent = function (element) {
      console.log('After Change Event called');
      console.log('DEBUG: ' + arguments.length + ' arguments were passed.');
      var eID = element.id;
      switch (eID) {
      case 'menu-toggle':
        //element.onClick = null
        break;
      case 'editor-tab':
        break;
      case 'gists-tab':
        break;
      case 'images-tab':
        break;
      case 'sensors-tab':
        break;
      case 'channels-tab':
        break;
      case 'logging-tab':
        break;
      case 'annotation-tab':
        break;
      case 'weariverse-tab':
        break;
      }
    };
    $scope.onExitEvent = function () {
      console.log('Exit Change Event called');
      console.log('DEBUG: ' + arguments.length + ' arguments were passed.');
    };
    $scope.onCompletedEvent = function (element) {
      console.log('Completed Event called');
      console.log('DEBUG: ' + arguments.length + ' arguments were passed.');
    };
    $scope.steps = [
      {
        element: '#page-title-text',
        intro: 'Welcome! You are currently in the WearScript Playground. Use your arrow keys or press the next button to continue with the tour!',
        position: 'bottom'
      },
      {
        element: '#menu-toggle',
        intro: 'Clicking this button will toggle the menu on the left.',
        position: 'right'
      },
      {
        element: '#shortcuts-button',
        intro: 'Keyboard shortcuts can be found by clicking this button.',
        position: 'left'
      },
      {
        element: '#file-manager',
        intro: 'Clicking this button will allow you to create or edit other files in this gist.',
        position: 'left'
      },
      {
        element: '#connection-status',
        intro: 'The connection status of the server and glass will be displayed here. <span style=\'color:green;\'>Green</span> means connected and <span style=\'color:red;\'>Red</span> means not connected.',
        position: 'left'
      },
      {
        element: '#setup',
        intro: 'Setup your devices with WearScript and auth with GitHub by clicking on the gears.',
        position: 'top'
      },
      {
        element: '#apidocs',
        intro: 'To find out more information about WearScript and for detailed docs click on the question mark.',
        position: 'top'
      },
      {
        element: '#statusBar',
        intro: 'You can find contextual information about your project status in the status bar.',
        position: 'top'
      },
      {
        element: '#tabs',
        intro: 'You can find all of the menus in the nav bar.',
        position: 'right'
      },
      {
        element: '#editor-tab',
        intro: 'This is the editor-tab. It is where all of the WearScript coding happens.',
        position: 'right'
      },
      {
        element: '#gists-tab',
        intro: 'Use the Gists tab to view and load gists.',
        position: 'right'
      },
      {
        element: '#weariverse-tab',
        intro: 'This is the Weariverse tab',
        position: 'right'
      },
      {
        element: '#images-tab',
        intro: 'When you wear a script that uses your devices camera, the imagery will be displayed in this tab.',
        position: 'right'
      },
      {
        element: '#sensors-tab',
        intro: 'Use this tab to view a graphical representation of sensor data.',
        position: 'right'
      },
      {
        element: '#channels-tab',
        intro: 'This is the Channels tab',
        position: 'right'
      },
      {
        element: '#logging-tab',
        intro: 'View logs in the logging tab',
        position: 'right'
      }
    ];
    $scope.IntroOptions = {
      steps: $scope.steps,
      scrollToElement: false,
      showStepNumbers: false,
      exitOnOverlayClick: true,
      exitOnEsc: true,
      nextLabel: 'next',
      prevLabel: 'prev',
      skipLabel: 'Exit',
      doneLabel: 'Thanks'
    };
  }
]);