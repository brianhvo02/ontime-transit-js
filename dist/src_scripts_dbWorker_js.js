/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/dbWorker.js":
/*!*********************************!*\
  !*** ./src/scripts/dbWorker.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _transitAccess__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transitAccess */ \"./src/scripts/transitAccess.js\");\n\n\n/*\n\ne.data: {\n    message: string;\n    payload?: {\n        [key: string]: string;\n    }\n}\n\n*/\n\nconst send = async (message, payload) => {\n  postMessage({\n    message,\n    payload\n  });\n};\nconst log = message => {\n  send('log', {\n    message\n  });\n};\nlet transitAccess;\nself.onmessage = async e => {\n  if (e.data.message.includes('get_')) {\n    if (transitAccess) {\n      const tableName = e.data.message.slice(4);\n      const table = await transitAccess.table(tableName).toArray();\n      send(e.data.message, table);\n    } else {\n      log('Database not yet loaded!');\n      send(e.data.message, 'Database not yet loaded!');\n    }\n  } else {\n    switch (e.data.message) {\n      case 'startAccess':\n        const checkUpdate = e.data.payload.checkUpdate;\n        const dbVersion = e.data.payload.dbVersion;\n        transitAccess = await new _transitAccess__WEBPACK_IMPORTED_MODULE_0__[\"default\"](checkUpdate, dbVersion, log, send).instance;\n        send('dbLoaded', {\n          version: transitAccess.verno\n        });\n        break;\n      default:\n        log(`${e.data.message} not yet implemented!`);\n    }\n  }\n};\nlog('Loaded db-worker.js');//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvc2NyaXB0cy9kYldvcmtlci5qcy5qcyIsIm1hcHBpbmdzIjoiOztBQUE0Qzs7QUFFNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUMsSUFBSSxHQUFHLE1BQUFBLENBQU9DLE9BQU8sRUFBRUMsT0FBTyxLQUFLO0VBQ3JDQyxXQUFXLENBQUM7SUFBRUYsT0FBTztJQUFFQztFQUFRLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBRUQsTUFBTUUsR0FBRyxHQUFHSCxPQUFPLElBQUk7RUFDbkJELElBQUksQ0FBQyxLQUFLLEVBQUU7SUFBRUM7RUFBUSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVELElBQUlJLGFBQWE7QUFFakJDLElBQUksQ0FBQ0MsU0FBUyxHQUFHLE1BQU1DLENBQUMsSUFBSTtFQUN4QixJQUFJQSxDQUFDLENBQUNDLElBQUksQ0FBQ1IsT0FBTyxDQUFDUyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDakMsSUFBSUwsYUFBYSxFQUFFO01BQ2YsTUFBTU0sU0FBUyxHQUFHSCxDQUFDLENBQUNDLElBQUksQ0FBQ1IsT0FBTyxDQUFDVyxLQUFLLENBQUMsQ0FBQyxDQUFDO01BQ3pDLE1BQU1DLEtBQUssR0FBRyxNQUFNUixhQUFhLENBQUNRLEtBQUssQ0FBQ0YsU0FBUyxDQUFDLENBQUNHLE9BQU8sRUFBRTtNQUM1RGQsSUFBSSxDQUFDUSxDQUFDLENBQUNDLElBQUksQ0FBQ1IsT0FBTyxFQUFFWSxLQUFLLENBQUM7SUFDL0IsQ0FBQyxNQUFNO01BQ0hULEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztNQUMvQkosSUFBSSxDQUFDUSxDQUFDLENBQUNDLElBQUksQ0FBQ1IsT0FBTyxFQUFFLDBCQUEwQixDQUFDO0lBQ3BEO0VBQ0osQ0FBQyxNQUFNO0lBQ0gsUUFBUU8sQ0FBQyxDQUFDQyxJQUFJLENBQUNSLE9BQU87TUFDbEIsS0FBSyxhQUFhO1FBQ2QsTUFBTWMsV0FBVyxHQUFHUCxDQUFDLENBQUNDLElBQUksQ0FBQ1AsT0FBTyxDQUFDYSxXQUFXO1FBQzlDLE1BQU1DLFNBQVMsR0FBR1IsQ0FBQyxDQUFDQyxJQUFJLENBQUNQLE9BQU8sQ0FBQ2MsU0FBUztRQUUxQ1gsYUFBYSxHQUFHLE1BQU0sSUFBSU4sc0RBQWEsQ0FBQ2dCLFdBQVcsRUFBRUMsU0FBUyxFQUFFWixHQUFHLEVBQUVKLElBQUksQ0FBQyxDQUFDaUIsUUFBUTtRQUNuRmpCLElBQUksQ0FBQyxVQUFVLEVBQUU7VUFDYmtCLE9BQU8sRUFBRWIsYUFBYSxDQUFDYztRQUMzQixDQUFDLENBQUM7UUFDRjtNQUVKO1FBQ0lmLEdBQUcsQ0FBRSxHQUFFSSxDQUFDLENBQUNDLElBQUksQ0FBQ1IsT0FBUSx1QkFBc0IsQ0FBQztJQUFDO0VBRTFEO0FBRUosQ0FBQztBQUVERyxHQUFHLENBQUMscUJBQXFCLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vbnRpbWUtdHJhbnNpdC8uL3NyYy9zY3JpcHRzL2RiV29ya2VyLmpzP2QzYWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRyYW5zaXRBY2Nlc3MgZnJvbSBcIi4vdHJhbnNpdEFjY2Vzc1wiO1xuXG4vKlxuXG5lLmRhdGE6IHtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgcGF5bG9hZD86IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xuICAgIH1cbn1cblxuKi9cblxuY29uc3Qgc2VuZCA9IGFzeW5jIChtZXNzYWdlLCBwYXlsb2FkKSA9PiB7XG4gICAgcG9zdE1lc3NhZ2UoeyBtZXNzYWdlLCBwYXlsb2FkIH0pO1xufVxuXG5jb25zdCBsb2cgPSBtZXNzYWdlID0+IHtcbiAgICBzZW5kKCdsb2cnLCB7IG1lc3NhZ2UgfSk7XG59XG5cbmxldCB0cmFuc2l0QWNjZXNzO1xuXG5zZWxmLm9ubWVzc2FnZSA9IGFzeW5jIGUgPT4ge1xuICAgIGlmIChlLmRhdGEubWVzc2FnZS5pbmNsdWRlcygnZ2V0XycpKSB7XG4gICAgICAgIGlmICh0cmFuc2l0QWNjZXNzKSB7XG4gICAgICAgICAgICBjb25zdCB0YWJsZU5hbWUgPSBlLmRhdGEubWVzc2FnZS5zbGljZSg0KTtcbiAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gYXdhaXQgdHJhbnNpdEFjY2Vzcy50YWJsZSh0YWJsZU5hbWUpLnRvQXJyYXkoKTtcbiAgICAgICAgICAgIHNlbmQoZS5kYXRhLm1lc3NhZ2UsIHRhYmxlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZygnRGF0YWJhc2Ugbm90IHlldCBsb2FkZWQhJyk7XG4gICAgICAgICAgICBzZW5kKGUuZGF0YS5tZXNzYWdlLCAnRGF0YWJhc2Ugbm90IHlldCBsb2FkZWQhJyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGUuZGF0YS5tZXNzYWdlKSB7XG4gICAgICAgICAgICBjYXNlICdzdGFydEFjY2Vzcyc6XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tVcGRhdGUgPSBlLmRhdGEucGF5bG9hZC5jaGVja1VwZGF0ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYlZlcnNpb24gPSBlLmRhdGEucGF5bG9hZC5kYlZlcnNpb247XG4gICAgXG4gICAgICAgICAgICAgICAgdHJhbnNpdEFjY2VzcyA9IGF3YWl0IG5ldyBUcmFuc2l0QWNjZXNzKGNoZWNrVXBkYXRlLCBkYlZlcnNpb24sIGxvZywgc2VuZCkuaW5zdGFuY2U7XG4gICAgICAgICAgICAgICAgc2VuZCgnZGJMb2FkZWQnLCB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRyYW5zaXRBY2Nlc3MudmVybm9cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBsb2coYCR7ZS5kYXRhLm1lc3NhZ2V9IG5vdCB5ZXQgaW1wbGVtZW50ZWQhYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59O1xuXG5sb2coJ0xvYWRlZCBkYi13b3JrZXIuanMnKTsiXSwibmFtZXMiOlsiVHJhbnNpdEFjY2VzcyIsInNlbmQiLCJtZXNzYWdlIiwicGF5bG9hZCIsInBvc3RNZXNzYWdlIiwibG9nIiwidHJhbnNpdEFjY2VzcyIsInNlbGYiLCJvbm1lc3NhZ2UiLCJlIiwiZGF0YSIsImluY2x1ZGVzIiwidGFibGVOYW1lIiwic2xpY2UiLCJ0YWJsZSIsInRvQXJyYXkiLCJjaGVja1VwZGF0ZSIsImRiVmVyc2lvbiIsImluc3RhbmNlIiwidmVyc2lvbiIsInZlcm5vIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/scripts/dbWorker.js\n");

/***/ }),

/***/ "./src/scripts/transitAccess.js":
/*!**************************************!*\
  !*** ./src/scripts/transitAccess.js ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ TransitAccess; }\n/* harmony export */ });\n/* harmony import */ var dexie__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dexie */ \"./node_modules/dexie/dist/modern/dexie.mjs\");\n/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! d3 */ \"./node_modules/d3/src/index.js\");\n/* harmony import */ var _zip_js_zip_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @zip.js/zip.js */ \"./node_modules/@zip.js/zip.js/index.js\");\nfunction _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\nfunction _toPropertyKey(arg) { var key = _toPrimitive(arg, \"string\"); return typeof key === \"symbol\" ? key : String(key); }\nfunction _toPrimitive(input, hint) { if (typeof input !== \"object\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \"default\"); if (typeof res !== \"object\") return res; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (hint === \"string\" ? String : Number)(input); }\n\n\n\nclass TransitAccess extends dexie__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n  // static SUPPORTED_AGENCIES = ['BA', 'SC', 'AC', 'SF', 'SM', 'CT', 'FS', 'GG', 'PE', 'SA', 'SB', 'SI', 'SO'];\n\n  constructor(checkUpdate, version, log, send) {\n    super(\"GTFS\");\n    _defineProperty(this, \"queue\", Object.fromEntries(TransitAccess.TABLES.map(table => [table, new Array()])));\n    this.checkUpdate = checkUpdate;\n    this.log = log;\n    this.send = send;\n    this.dbVersion = version;\n    this.instance = this.newInstance();\n  }\n  async getGTFSFeeds() {\n    const agencyPromises = this.agencies.map(async agency => {\n      const agencyGTFSZip = await fetch(`https://api.511.org/transit/datafeeds?operator_id=${agency['Id']}&api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7`);\n      const agencyGTFSBlob = await agencyGTFSZip.blob();\n      const agencyGTFSZipFileReader = new _zip_js_zip_js__WEBPACK_IMPORTED_MODULE_2__.BlobReader(agencyGTFSBlob);\n      const agencyGTFSZipReader = new _zip_js_zip_js__WEBPACK_IMPORTED_MODULE_2__.ZipReader(agencyGTFSZipFileReader);\n      const agencyGTFSEntries = await agencyGTFSZipReader.getEntries();\n      const entryPromises = agencyGTFSEntries.map(async entry => {\n        const name = entry.filename.slice(0, entry.filename.indexOf('.'));\n        const writer = new _zip_js_zip_js__WEBPACK_IMPORTED_MODULE_2__.TextWriter();\n        const text = await entry.getData(writer);\n        const parsed = (0,d3__WEBPACK_IMPORTED_MODULE_1__.csvParse)(text, d3__WEBPACK_IMPORTED_MODULE_1__.autoType);\n        return [name, parsed];\n      });\n      const entries = Object.fromEntries(await Promise.all(entryPromises));\n      await agencyGTFSZipReader.close();\n      return [agency['Id'], entries];\n    });\n    const agencyDataEntries = await Promise.all(agencyPromises);\n    this.log('GTFS feeds retreived.');\n    return Object.fromEntries(agencyDataEntries);\n  }\n  async newInstance() {\n    if (this.checkUpdate) {\n      const agenciesData = await fetch('https://api.511.org/transit/gtfsoperators?api_key=7cf5660e-215b-489d-87b1-78bb3ee006b7');\n      this.agencies = await agenciesData.json();\n      // .filter(agency => TransitAccess.SUPPORTED_AGENCIES.includes(agency['Id']));\n      this.dbVersion = this.agencies.reduce((acc, agency) => acc + new Date(agency['LastGenerated']).getTime(), 0);\n      let openedDb;\n      let verno;\n      try {\n        openedDb = await this.open();\n        verno = openedDb.verno;\n        if (this.dbVersion === verno) {\n          this.checkUpdate = false;\n        } else {\n          const lastGenerated = await openedDb.table('LastGenerated').toArray();\n          this.agencies = this.agencies.filter(agency => !lastGenerated.find(obj => obj['Id'] === agency['Id']) || new Date(agency['LastGenerated']) > new Date(lastGenerated.find(obj => obj['Id'] === agency['Id'])['LastGenerated']));\n        }\n      } catch (e) {\n        this.log(e.toString());\n        this.firstTime = true;\n      } finally {\n        if (openedDb) openedDb.close();\n      }\n    }\n    const schema = Object.fromEntries(TransitAccess.TABLES.map(table => [table, ['id'].concat(TransitAccess.TABLE_MAP[table].includes('agency_id') ? [] : ['agency_id']).concat(TransitAccess.TABLE_MAP[table].length > 1 ? `[${TransitAccess.TABLE_MAP[table].join('+')}]` : TransitAccess.TABLE_MAP[table][0]).join(', ')]));\n    this.version(this.dbVersion).stores(schema);\n    await this.open();\n    if (this.checkUpdate) {\n      const data = await this.getGTFSFeeds();\n      if (!this.firstTime) {\n        const clearTables = this.tables.map(table => table.where('agency_id').anyOf(this.agencies.map(agency => agency['Id'])).delete());\n        await Promise.all(clearTables);\n        this.log('Cleared tables.');\n      }\n      for (let agency_id in data) {\n        const agency = data[agency_id];\n        for (let table in agency) {\n          if (TransitAccess.TABLES.includes(table)) {\n            const records = agency[table].map(record => {\n              return {\n                id: [agency_id].concat(TransitAccess.TABLE_MAP[table].map(id => record[id])).join('_'),\n                agency_id,\n                ...record\n              };\n            });\n            this.queue[table] = this.queue[table].concat(records);\n          }\n        }\n      }\n      this.queue['LastGenerated'] = this.agencies.map(agency => {\n        agency.id = agency.Id;\n        return agency;\n      });\n      this.totalQueue = Object.values(this.queue).reduce((acc, arr) => acc + arr.length, 0);\n      this.currentQueue = 0;\n      this.batchAdd();\n    }\n    return this;\n  }\n  async batchAdd() {\n    const currentTable = TransitAccess.TABLES.find(table => this.queue[table].length > 0);\n    const batch = this.queue[currentTable].splice(0, TransitAccess.PROCESSING_COUNT);\n    const startTime = new Date();\n    this.log(`Writing ${batch.length} records to table \"${currentTable}\"`);\n    await this.table(currentTable).bulkAdd(batch);\n    const timeElapsed = new Date(new Date() - startTime);\n    this.log(`Finished in ${timeElapsed.getSeconds()} sec, ${timeElapsed.getMilliseconds()} ms`);\n    this.currentQueue += batch.length;\n    this.send('updateProgress', {\n      progress: this.currentQueue / this.totalQueue\n    });\n    if (Object.values(this.queue).reduce((acc, queue) => acc + queue.length) > 0) this.batchAdd();\n  }\n}\n_defineProperty(TransitAccess, \"PROCESSING_COUNT\", 200000);\n_defineProperty(TransitAccess, \"TABLE_MAP\", {\n  'agency': ['agency_id'],\n  'mtc_feed_versions': ['agency_id'],\n  'routes': ['route_id'],\n  // 'route_attributes': ['route_id'],\n  'stops': ['stop_id'],\n  'trips': ['trip_id'],\n  'areas': ['area_id'],\n  'shapes': ['shape_id', 'shape_pt_sequence'],\n  'levels': ['level_id'],\n  'calendar': ['service_id'],\n  'calendar_dates': ['service_id', 'date'],\n  'calendar_attributes': ['service_id'],\n  'directions': ['route_id', 'direction_id'],\n  'fare_products': ['fare_product_id', 'fare_media_id'],\n  'pathways': ['pathway_id'],\n  'rider_categories': ['rider_category_id'],\n  'stop_areas': ['area_id', 'stop_id'],\n  // 'stop_times': ['trip_id', 'stop_sequence'],\n  'LastGenerated': ['Id']\n});\n_defineProperty(TransitAccess, \"TABLES\", Object.keys(TransitAccess.TABLE_MAP));//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQztFQUMxQyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUM7RUFDckQsVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDO0VBQzFCLGtCQUFrQixFQUFFLENBQUMsbUJBQW1CLENBQUM7RUFDekMsWUFBWSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQztFQUNwQztFQUNBLGVBQWUsRUFBRSxDQUFDLElBQUk7QUFDMUIsQ0FBQztBQUFBTSxlQUFBLENBekJnQk4sYUFBYSxZQTJCZE8sTUFBTSxDQUFDdUYsSUFBSSxDQTNCVjlGLGFBQWEsQ0EyQkc4RCxTQUFTLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vbnRpbWUtdHJhbnNpdC8uL3NyYy9zY3JpcHRzL3RyYW5zaXRBY2Nlc3MuanM/Yjc5NSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGV4aWUgZnJvbSAnZGV4aWUnO1xuaW1wb3J0IHsgY3N2UGFyc2UsIGF1dG9UeXBlIH0gZnJvbSAnZDMnO1xuaW1wb3J0IHsgWmlwUmVhZGVyLCBCbG9iUmVhZGVyLCBUZXh0V3JpdGVyIH0gZnJvbSBcIkB6aXAuanMvemlwLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zaXRBY2Nlc3MgZXh0ZW5kcyBEZXhpZSB7XG4gICAgcXVldWUgPSBPYmplY3QuZnJvbUVudHJpZXMoVHJhbnNpdEFjY2Vzcy5UQUJMRVMubWFwKHRhYmxlID0+IFt0YWJsZSwgbmV3IEFycmF5KCldKSk7XG5cbiAgICBzdGF0aWMgUFJPQ0VTU0lOR19DT1VOVCA9IDIwMDAwMDtcbiAgICAvLyBzdGF0aWMgU1VQUE9SVEVEX0FHRU5DSUVTID0gWydCQScsICdTQycsICdBQycsICdTRicsICdTTScsICdDVCcsICdGUycsICdHRycsICdQRScsICdTQScsICdTQicsICdTSScsICdTTyddO1xuICAgIHN0YXRpYyBUQUJMRV9NQVAgPSB7XG4gICAgICAgICdhZ2VuY3knOiBbJ2FnZW5jeV9pZCddLFxuICAgICAgICAnbXRjX2ZlZWRfdmVyc2lvbnMnOiBbJ2FnZW5jeV9pZCddLFxuICAgICAgICAncm91dGVzJzogWydyb3V0ZV9pZCddLFxuICAgICAgICAvLyAncm91dGVfYXR0cmlidXRlcyc6IFsncm91dGVfaWQnXSxcbiAgICAgICAgJ3N0b3BzJzogWydzdG9wX2lkJ10sXG4gICAgICAgICd0cmlwcyc6IFsndHJpcF9pZCddLFxuICAgICAgICAnYXJlYXMnOiBbJ2FyZWFfaWQnXSxcbiAgICAgICAgJ3NoYXBlcyc6IFsnc2hhcGVfaWQnLCAnc2hhcGVfcHRfc2VxdWVuY2UnXSxcbiAgICAgICAgJ2xldmVscyc6IFsnbGV2ZWxfaWQnXSxcbiAgICAgICAgJ2NhbGVuZGFyJzogWydzZXJ2aWNlX2lkJ10sXG4gICAgICAgICdjYWxlbmRhcl9kYXRlcyc6IFsnc2VydmljZV9pZCcsICdkYXRlJ10sXG4gICAgICAgICdjYWxlbmRhcl9hdHRyaWJ1dGVzJzogWydzZXJ2aWNlX2lkJ10sXG4gICAgICAgICdkaXJlY3Rpb25zJzogWydyb3V0ZV9pZCcsICdkaXJlY3Rpb25faWQnXSxcbiAgICAgICAgJ2ZhcmVfcHJvZHVjdHMnOiBbJ2ZhcmVfcHJvZHVjdF9pZCcsICdmYXJlX21lZGlhX2lkJ10sXG4gICAgICAgICdwYXRod2F5cyc6IFsncGF0aHdheV9pZCddLFxuICAgICAgICAncmlkZXJfY2F0ZWdvcmllcyc6IFsncmlkZXJfY2F0ZWdvcnlfaWQnXSxcbiAgICAgICAgJ3N0b3BfYXJlYXMnOiBbJ2FyZWFfaWQnLCAnc3RvcF9pZCddLFxuICAgICAgICAvLyAnc3RvcF90aW1lcyc6IFsndHJpcF9pZCcsICdzdG9wX3NlcXVlbmNlJ10sXG4gICAgICAgICdMYXN0R2VuZXJhdGVkJzogWydJZCddLFxuICAgIH1cblxuICAgIHN0YXRpYyBUQUJMRVMgPSBPYmplY3Qua2V5cyh0aGlzLlRBQkxFX01BUCk7XG5cbiAgICBjb25zdHJ1Y3RvcihjaGVja1VwZGF0ZSwgdmVyc2lvbiwgbG9nLCBzZW5kKSB7XG4gICAgICAgIHN1cGVyKFwiR1RGU1wiKTtcbiAgICAgICAgdGhpcy5jaGVja1VwZGF0ZSA9IGNoZWNrVXBkYXRlO1xuICAgICAgICB0aGlzLmxvZyA9IGxvZztcbiAgICAgICAgdGhpcy5zZW5kID0gc2VuZDtcbiAgICAgICAgdGhpcy5kYlZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICB0aGlzLmluc3RhbmNlID0gdGhpcy5uZXdJbnN0YW5jZSgpO1xuICAgIH1cblxuICAgIGFzeW5jIGdldEdURlNGZWVkcygpIHtcbiAgICAgICAgY29uc3QgYWdlbmN5UHJvbWlzZXMgPSB0aGlzLmFnZW5jaWVzLm1hcChhc3luYyBhZ2VuY3kgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWdlbmN5R1RGU1ppcCA9IGF3YWl0IGZldGNoKGBodHRwczovL2FwaS41MTEub3JnL3RyYW5zaXQvZGF0YWZlZWRzP29wZXJhdG9yX2lkPSR7YWdlbmN5WydJZCddfSZhcGlfa2V5PTdjZjU2NjBlLTIxNWItNDg5ZC04N2IxLTc4YmIzZWUwMDZiN2ApXG4gICAgICAgICAgICBjb25zdCBhZ2VuY3lHVEZTQmxvYiA9IGF3YWl0IGFnZW5jeUdURlNaaXAuYmxvYigpO1xuICAgICAgICAgICAgY29uc3QgYWdlbmN5R1RGU1ppcEZpbGVSZWFkZXIgPSBuZXcgQmxvYlJlYWRlcihhZ2VuY3lHVEZTQmxvYik7XG4gICAgICAgICAgICBjb25zdCBhZ2VuY3lHVEZTWmlwUmVhZGVyID0gbmV3IFppcFJlYWRlcihhZ2VuY3lHVEZTWmlwRmlsZVJlYWRlcik7XG4gICAgICAgICAgICBjb25zdCBhZ2VuY3lHVEZTRW50cmllcyA9IGF3YWl0IGFnZW5jeUdURlNaaXBSZWFkZXIuZ2V0RW50cmllcygpO1xuICAgICAgICAgICAgY29uc3QgZW50cnlQcm9taXNlcyA9IGFnZW5jeUdURlNFbnRyaWVzLm1hcChhc3luYyBlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGVudHJ5LmZpbGVuYW1lLnNsaWNlKDAsIGVudHJ5LmZpbGVuYW1lLmluZGV4T2YoJy4nKSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IFRleHRXcml0ZXIoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZW50cnkuZ2V0RGF0YSh3cml0ZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IGNzdlBhcnNlKHRleHQsIGF1dG9UeXBlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW25hbWUsIHBhcnNlZF07XG4gICAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZnJvbUVudHJpZXMoYXdhaXQgUHJvbWlzZS5hbGwoZW50cnlQcm9taXNlcykpO1xuICAgICAgICAgICAgYXdhaXQgYWdlbmN5R1RGU1ppcFJlYWRlci5jbG9zZSgpO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIFthZ2VuY3lbJ0lkJ10sIGVudHJpZXNdO1xuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgY29uc3QgYWdlbmN5RGF0YUVudHJpZXMgPSBhd2FpdCBQcm9taXNlLmFsbChhZ2VuY3lQcm9taXNlcyk7XG4gICAgXG4gICAgICAgIHRoaXMubG9nKCdHVEZTIGZlZWRzIHJldHJlaXZlZC4nKTtcbiAgICBcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhhZ2VuY3lEYXRhRW50cmllcyk7XG4gICAgfVxuXG4gICAgYXN5bmMgbmV3SW5zdGFuY2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrVXBkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBhZ2VuY2llc0RhdGEgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkuNTExLm9yZy90cmFuc2l0L2d0ZnNvcGVyYXRvcnM/YXBpX2tleT03Y2Y1NjYwZS0yMTViLTQ4OWQtODdiMS03OGJiM2VlMDA2YjcnKTtcbiAgICAgICAgICAgIHRoaXMuYWdlbmNpZXMgPSAoYXdhaXQgYWdlbmNpZXNEYXRhLmpzb24oKSlcbiAgICAgICAgICAgIC8vIC5maWx0ZXIoYWdlbmN5ID0+IFRyYW5zaXRBY2Nlc3MuU1VQUE9SVEVEX0FHRU5DSUVTLmluY2x1ZGVzKGFnZW5jeVsnSWQnXSkpO1xuICAgICAgICAgICAgdGhpcy5kYlZlcnNpb24gPSB0aGlzLmFnZW5jaWVzLnJlZHVjZSgoYWNjLCBhZ2VuY3kpID0+IGFjYyArIG5ldyBEYXRlKGFnZW5jeVsnTGFzdEdlbmVyYXRlZCddKS5nZXRUaW1lKCksIDApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgb3BlbmVkRGI7XG4gICAgICAgICAgICBsZXQgdmVybm87XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9wZW5lZERiID0gYXdhaXQgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgdmVybm8gPSBvcGVuZWREYi52ZXJubztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRiVmVyc2lvbiA9PT0gdmVybm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1VwZGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RHZW5lcmF0ZWQgPSBhd2FpdCBvcGVuZWREYi50YWJsZSgnTGFzdEdlbmVyYXRlZCcpLnRvQXJyYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZ2VuY2llcyA9IHRoaXMuYWdlbmNpZXMuZmlsdGVyKGFnZW5jeSA9PiAhbGFzdEdlbmVyYXRlZC5maW5kKG9iaiA9PiBvYmpbJ0lkJ10gPT09IGFnZW5jeVsnSWQnXSkgfHwgbmV3IERhdGUoYWdlbmN5WydMYXN0R2VuZXJhdGVkJ10pID4gbmV3IERhdGUobGFzdEdlbmVyYXRlZC5maW5kKG9iaiA9PiBvYmpbJ0lkJ10gPT09IGFnZW5jeVsnSWQnXSlbJ0xhc3RHZW5lcmF0ZWQnXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nKGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdFRpbWUgPSB0cnVlO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAob3BlbmVkRGIpIG9wZW5lZERiLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHNjaGVtYSA9IE9iamVjdC5mcm9tRW50cmllcyhUcmFuc2l0QWNjZXNzLlRBQkxFUy5tYXAodGFibGUgPT4gWyB0YWJsZSwgWydpZCddLmNvbmNhdChUcmFuc2l0QWNjZXNzLlRBQkxFX01BUFt0YWJsZV0uaW5jbHVkZXMoJ2FnZW5jeV9pZCcpID8gW10gOiBbICdhZ2VuY3lfaWQnIF0pLmNvbmNhdChUcmFuc2l0QWNjZXNzLlRBQkxFX01BUFt0YWJsZV0ubGVuZ3RoID4gMSA/IGBbJHtUcmFuc2l0QWNjZXNzLlRBQkxFX01BUFt0YWJsZV0uam9pbignKycpfV1gIDogVHJhbnNpdEFjY2Vzcy5UQUJMRV9NQVBbdGFibGVdWzBdKS5qb2luKCcsICcpIF0pKTtcbiAgICAgICAgdGhpcy52ZXJzaW9uKHRoaXMuZGJWZXJzaW9uKS5zdG9yZXMoc2NoZW1hKTtcbiAgICAgICAgXG4gICAgICAgIGF3YWl0IHRoaXMub3BlbigpO1xuXG4gICAgICAgIGlmICh0aGlzLmNoZWNrVXBkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5nZXRHVEZTRmVlZHMoKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmZpcnN0VGltZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNsZWFyVGFibGVzID0gdGhpcy50YWJsZXMubWFwKHRhYmxlID0+IHRhYmxlLndoZXJlKCdhZ2VuY3lfaWQnKS5hbnlPZih0aGlzLmFnZW5jaWVzLm1hcChhZ2VuY3kgPT4gYWdlbmN5WydJZCddKSkuZGVsZXRlKCkpO1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGNsZWFyVGFibGVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZygnQ2xlYXJlZCB0YWJsZXMuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAobGV0IGFnZW5jeV9pZCBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWdlbmN5ID0gZGF0YVthZ2VuY3lfaWRdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRhYmxlIGluIGFnZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoVHJhbnNpdEFjY2Vzcy5UQUJMRVMuaW5jbHVkZXModGFibGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNvcmRzID0gYWdlbmN5W3RhYmxlXS5tYXAocmVjb3JkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFsgYWdlbmN5X2lkIF0uY29uY2F0KFRyYW5zaXRBY2Nlc3MuVEFCTEVfTUFQW3RhYmxlXS5tYXAoaWQgPT4gcmVjb3JkW2lkXSkpLmpvaW4oJ18nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWdlbmN5X2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5yZWNvcmQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWVbdGFibGVdID0gdGhpcy5xdWV1ZVt0YWJsZV0uY29uY2F0KHJlY29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucXVldWVbJ0xhc3RHZW5lcmF0ZWQnXSA9IHRoaXMuYWdlbmNpZXMubWFwKGFnZW5jeSA9PiB7XG4gICAgICAgICAgICAgICAgYWdlbmN5LmlkID0gYWdlbmN5LklkO1xuICAgICAgICAgICAgICAgIHJldHVybiBhZ2VuY3k7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnRvdGFsUXVldWUgPSBPYmplY3QudmFsdWVzKHRoaXMucXVldWUpLnJlZHVjZSgoYWNjLCBhcnIpID0+IGFjYyArIGFyci5sZW5ndGgsIDApO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UXVldWUgPSAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJhdGNoQWRkKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3luYyBiYXRjaEFkZCgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFRhYmxlID0gVHJhbnNpdEFjY2Vzcy5UQUJMRVMuZmluZCh0YWJsZSA9PiB0aGlzLnF1ZXVlW3RhYmxlXS5sZW5ndGggPiAwKTtcbiAgICAgICAgY29uc3QgYmF0Y2ggPSB0aGlzLnF1ZXVlW2N1cnJlbnRUYWJsZV0uc3BsaWNlKDAsIFRyYW5zaXRBY2Nlc3MuUFJPQ0VTU0lOR19DT1VOVCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMubG9nKGBXcml0aW5nICR7YmF0Y2gubGVuZ3RofSByZWNvcmRzIHRvIHRhYmxlIFwiJHtjdXJyZW50VGFibGV9XCJgKTtcbiAgICAgICAgYXdhaXQgdGhpcy50YWJsZShjdXJyZW50VGFibGUpLmJ1bGtBZGQoYmF0Y2gpO1xuICAgICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IG5ldyBEYXRlKG5ldyBEYXRlKCkgLSBzdGFydFRpbWUpO1xuICAgICAgICB0aGlzLmxvZyhgRmluaXNoZWQgaW4gJHt0aW1lRWxhcHNlZC5nZXRTZWNvbmRzKCl9IHNlYywgJHt0aW1lRWxhcHNlZC5nZXRNaWxsaXNlY29uZHMoKX0gbXNgKTtcbiAgICAgICAgdGhpcy5jdXJyZW50UXVldWUgKz0gYmF0Y2gubGVuZ3RoO1xuICAgICAgICB0aGlzLnNlbmQoJ3VwZGF0ZVByb2dyZXNzJywge1xuICAgICAgICAgICAgcHJvZ3Jlc3M6IHRoaXMuY3VycmVudFF1ZXVlIC8gdGhpcy50b3RhbFF1ZXVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoT2JqZWN0LnZhbHVlcyh0aGlzLnF1ZXVlKS5yZWR1Y2UoKGFjYywgcXVldWUpID0+IGFjYyArIHF1ZXVlLmxlbmd0aCkgPiAwKSB0aGlzLmJhdGNoQWRkKCk7XG4gICAgfVxufSJdLCJuYW1lcyI6WyJEZXhpZSIsImNzdlBhcnNlIiwiYXV0b1R5cGUiLCJaaXBSZWFkZXIiLCJCbG9iUmVhZGVyIiwiVGV4dFdyaXRlciIsIlRyYW5zaXRBY2Nlc3MiLCJjb25zdHJ1Y3RvciIsImNoZWNrVXBkYXRlIiwidmVyc2lvbiIsImxvZyIsInNlbmQiLCJfZGVmaW5lUHJvcGVydHkiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsIlRBQkxFUyIsIm1hcCIsInRhYmxlIiwiQXJyYXkiLCJkYlZlcnNpb24iLCJpbnN0YW5jZSIsIm5ld0luc3RhbmNlIiwiZ2V0R1RGU0ZlZWRzIiwiYWdlbmN5UHJvbWlzZXMiLCJhZ2VuY2llcyIsImFnZW5jeSIsImFnZW5jeUdURlNaaXAiLCJmZXRjaCIsImFnZW5jeUdURlNCbG9iIiwiYmxvYiIsImFnZW5jeUdURlNaaXBGaWxlUmVhZGVyIiwiYWdlbmN5R1RGU1ppcFJlYWRlciIsImFnZW5jeUdURlNFbnRyaWVzIiwiZ2V0RW50cmllcyIsImVudHJ5UHJvbWlzZXMiLCJlbnRyeSIsIm5hbWUiLCJmaWxlbmFtZSIsInNsaWNlIiwiaW5kZXhPZiIsIndyaXRlciIsInRleHQiLCJnZXREYXRhIiwicGFyc2VkIiwiZW50cmllcyIsIlByb21pc2UiLCJhbGwiLCJjbG9zZSIsImFnZW5jeURhdGFFbnRyaWVzIiwiYWdlbmNpZXNEYXRhIiwianNvbiIsInJlZHVjZSIsImFjYyIsIkRhdGUiLCJnZXRUaW1lIiwib3BlbmVkRGIiLCJ2ZXJubyIsIm9wZW4iLCJsYXN0R2VuZXJhdGVkIiwidG9BcnJheSIsImZpbHRlciIsImZpbmQiLCJvYmoiLCJlIiwidG9TdHJpbmciLCJmaXJzdFRpbWUiLCJzY2hlbWEiLCJjb25jYXQiLCJUQUJMRV9NQVAiLCJpbmNsdWRlcyIsImxlbmd0aCIsImpvaW4iLCJzdG9yZXMiLCJkYXRhIiwiY2xlYXJUYWJsZXMiLCJ0YWJsZXMiLCJ3aGVyZSIsImFueU9mIiwiZGVsZXRlIiwiYWdlbmN5X2lkIiwicmVjb3JkcyIsInJlY29yZCIsImlkIiwicXVldWUiLCJJZCIsInRvdGFsUXVldWUiLCJ2YWx1ZXMiLCJhcnIiLCJjdXJyZW50UXVldWUiLCJiYXRjaEFkZCIsImN1cnJlbnRUYWJsZSIsImJhdGNoIiwic3BsaWNlIiwiUFJPQ0VTU0lOR19DT1VOVCIsInN0YXJ0VGltZSIsImJ1bGtBZGQiLCJ0aW1lRWxhcHNlZCIsImdldFNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJwcm9ncmVzcyIsImtleXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/scripts/transitAccess.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = function() {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, [0], function() { return __webpack_require__("./src/scripts/dbWorker.js"); })
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	!function() {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = function(chunkId) {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce(function(promises, key) {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	!function() {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.miniCssF = function(chunkId) {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_scripts_dbWorker_js": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = function(data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = function(chunkId, promises) {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkontime_transit"] = self["webpackChunkontime_transit"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	!function() {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = function() {
/******/ 			return __webpack_require__.e(0).then(next);
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;