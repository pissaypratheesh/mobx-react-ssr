const isProduction = process.env.NODE_ENV === "production";
const enableTestLogs = (process.env.NODE_LOGS === "true");
const isQa = process.env.NODE_ENV === "qa";
const isStage = process.env.NODE_ENV === "stage";
const appVersion = process.env.APP_VERSION || '1.0.40';
const swVersion = process.env.APP_VERSION || '1.0.40';
const pageSize = 16;
const callRetries = 3;
const enableAd = true;
const cacheAPIHeader = 180;
const assetsExpiry = 30 * 86400 * 1000; // 30 days
const notifsInboxLimit = 25;
const bundleExpiry = 30 * 24 * 60 * 60 * 1000;//30 minutes
const updateDataThreshold = 1.5; //in minutes
const CtoSTimeout = isProduction ? 120000 : 90000;
const StoSTimeout = isProduction ? 10000 : 21000;
const signatureName = 'nhcpV1';
const fingerprintVersioning = '4';
const moniterForElemInView = 500;//in ms, interval to moniter if the related details comes into view
const cardInViewMoniter = 500;//in ms, interval to moniter if a card comes into view
const handshakeFrequency = 30 * 60000; //in ms, 30 minutes
const coolOff_1_List = 1; // As per doc its 48
const coolOff_1_Detail = 1;// As per doc its 24
const coolOff_1_Notification = 1;//As per doc its 24
const coolOff_1_Install = 1; // As per doc its 24
const adsCallTimeout = 600;
const firstListCardAdSize = 'ads1';
const comscoreIds = {lallantp:8549097,pakwan:8549097,ichowk:8549097,dailyo:8549097,odanari:8549097,indianmo:27818398,dinamani:17900848,newexpress:17900848,kprabha:17900848,edex:17900848,samaka:17900848,thatstamil:7732551,thatshindi:7732551,aajtak:8549097,wonder:8549097,bizztoday:8549097,indiatoday:8549097,headline:8549097,vika:20272655,livehindu:6035286,httimes:6035286,livemint:6035286,desimart:6035286,pradben:6683813,pradguj:6683813,pradehin:6683813,pradeurd:6683813,abp:17824659,ebela:17824659,prabhatkhabar:23243182,dailynn:23195704,newtoday:23195704,catchne:18075250,catchhi:18075250,amar:21916725,deccanch:17503308,jagran:13184768,inextliv:13184768,onlymyhealth:13184768,onlymyhi:13184768,newdunia:13184768,thatsmalayalam:7732551,thatstelegu:7732551,thatskannada:7732551,oneindia:7732551,thatsbengali:7732551,thatsgujarati:7732551,hboldsky:7732551,boldben:7732551,boldguj:7732551,boldkan:7732551,boldmal:7732551,boldsky:7732551,boldtam:7732551,boldtel:7732551,cindia:7732551,tcareeri:7732551,drivekan:7732551,drivemal:7732551,Drivespark:7732551,drivetam:7732551,dspark:7732551,hdspark:7732551,filmi:7732551,filmihin:7732551,filmikan:7732551,filmimal:7732551,filmitam:7732551,filmitel:7732551,goodkan:7732551,goodmal:7732551,goodtam:7732551,goodtel:7732551,goreturn:7732551,hgreturn:7732551,malgiz:7732551,hingiz:7732551,kangiz:7732551,enggiz:7732551,tamgiz:7732551,telgiz:7732551,knativep:7732551,mnativep:7732551,nativeen:7732551,nativehi:7732551,nativeta:7732551,nativete:7732551,scrol:19749776,satyagra:19749776,quint:20519288,hquint:20519288,bloomqui:20519288,minutese:18120612,minutesh:18120612,indexp:8738137,finexp:8738137,jsatta:8738137,loksatta:8738137,pvilla:23522848,pinkhi:23522848,telegrap:17824659,tonline:17824659,abpnewvs:17824659,tonlinev:17824659,ebelavid:17824659,intvnews:20465327,khabartv:20465327,digban:9989804,dighin:9989804,digeng:9989804,digmal:9989804,digmar:9989804,digtel:9989804,lokmat:22995154,webtam:17920840,malweb:17920840,gujweb:17920840,kanweb:17920840,marweb:17920840,telweb:17920840,hinweb:17920840,khaskhab:18900610,aapkisa:18900610,ifairer:18900610,astrosaa:18900610,iautoin:18900610,khashin:18900610,witty:18451623,within:18451623,punjkes:21043170,jagban:21043170,boltad:21043170,poltad:21043170,navodayt:21043170,dinamalar:7144929,mobiles:18740420,dna:9254297,wionnew:9254297,zeebeng:9254297,zeemal:9254297,zeehin:9254297,zeemar:9254297,zeeeng:9254297,zeetam:9254297,zbusnes:9254297,bgrhin:9254297,bgr:9254297,indhin:9254297,indmar:9254297,indban:9254297,india:9254297,helmar:9254297,heltam:9254297,helhin:9254297,heleng:9254297,bowohi:9254297,bolwod:9254297,criceng:9254297,crichin:9254297,espn:3000005,asianene:24936138,suvarna:24936138,newsftam:24936138,asnewsab:24936138,asnete:24936138,zenpa:23645548,hzenpa:23645548,zenmal:23645548,zentel:23645548,zenbang:23645548,zenmar:23645548,spotboye:19264324,mblinden:23500727,digittam:9989804,digitkan:9989804,lokmhin:22995154,zeenewgu:9254297,zeenewte:9254297,zeenewka:9254297};
const bbcComIds = {bbceng:'http://app.dailyhunt.com/english',bbchind:'http://app.dailyhunt.com/hindi',bbctam:'http://app.dailyhunt.com/tamil',bbcbang:'http://app.dailyhunt.com/bengali',bbcurdu:'http://app.dailyhunt.com/urdu',bnindia:'http://app.dailyhunt.com/nepali',bbcnepal:'http://app.dailyhunt.com/nepali',bbctel:'http://app.dailyhunt.com/telugu',bcpun:'http://app.dailyhunt.com/punjabi',bbcguj:'http://app.dailyhunt.com/gujarati',bbcmar:'http://app.dailyhunt.com/marathi'}

//Instrumentation constants are in src/lib/instrumentation.js

export {
  coolOff_1_List,
  coolOff_1_Detail,
  coolOff_1_Notification,
  coolOff_1_Install,
  enableTestLogs,
  bundleExpiry,
  isProduction,
  pageSize,
  comscoreIds,
  bbcComIds,
  updateDataThreshold,
  CtoSTimeout,
  StoSTimeout,
  callRetries,
  isQa,
  cacheAPIHeader,
  assetsExpiry,
  appVersion,
  signatureName,
  moniterForElemInView,
  cardInViewMoniter,
  handshakeFrequency,
  isStage,
  fingerprintVersioning,
  enableAd,
  swVersion,
  notifsInboxLimit,
  adsCallTimeout,
  firstListCardAdSize
};

