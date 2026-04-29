const sources = [
  {
    "name": "Asian Development Bank (ADB)",
    "url": "http://feeds.feedburner.com/adb_news",
    "region": "Global"
  },
  {
    "name": "batimes.com.ar",
    "url": "https://www.batimes.com.ar/feed",
    "region": "Argentina"
  },
  {
    "name": "en.mercopress.com",
    "url": "https://en.mercopress.com/rss/",
    "region": "Argentina"
  },
  {
    "name": "thebubble.com",
    "url": "https://www.thebubble.com/feed",
    "region": "Argentina"
  },
  {
    "name": "argentinareports.com",
    "url": "https://argentinareports.com/rss",
    "region": "Argentina"
  },
  {
    "name": "afr.com",
    "url": "https://www.afr.com/feed",
    "region": "Australia"
  },
  {
    "name": "businessnewsaustralia.com",
    "url": "NO_RSS",
    "region": "Australia"
  },
  {
    "name": "theaustralian.com.au",
    "url": "https://www.theaustralian.com.au/feed",
    "region": "Australia"
  },
  {
    "name": "smartcompany.com.au",
    "url": "https://www.smartcompany.com.au/feed/",
    "region": "Australia"
  },
  {
    "name": "abc.net.au",
    "url": "https://www.abc.net.au/feed",
    "region": "Australia"
  },
  {
    "name": "thelocal.at",
    "url": "NO_RSS",
    "region": "Austria"
  },
  {
    "name": "vienna.at",
    "url": "https://www.vienna.at/feed",
    "region": "Austria"
  },
  {
    "name": "azernews.az",
    "url": "https://www.azernews.az/feed",
    "region": "Azerbaijan"
  },
  {
    "name": "en.trend.az",
    "url": "https://en.trend.az/rss",
    "region": "Azerbaijan"
  },
  {
    "name": "apa.az",
    "url": "https://apa.az/rss",
    "region": "Azerbaijan"
  },
  {
    "name": "turan.az",
    "url": "https://www.turan.az/feed",
    "region": "Azerbaijan"
  },
  {
    "name": "caspianenergy.net",
    "url": "https://keysolutions.uk.com/feed/",
    "region": "Azerbaijan"
  },
  {
    "name": "gdnonline.com",
    "url": "https://www.gdnonline.com/feed",
    "region": "Bahrain"
  },
  {
    "name": "bahrainthismonth.com",
    "url": "https://www.bahrainthismonth.com/feed",
    "region": "Bahrain"
  },
  {
    "name": "bna.bh",
    "url": "NO_RSS",
    "region": "Bahrain"
  },
  {
    "name": "bizbahrain.com",
    "url": "https://www.bizbahrain.com/feed/",
    "region": "Bahrain"
  },
  {
    "name": "thedailystar.net",
    "url": "https://www.thedailystar.net/rss.xml",
    "region": "Bangladesh"
  },
  {
    "name": "thefinancialexpress.com.bd",
    "url": "https://thefinancialexpress.com.bd/feed",
    "region": "Bangladesh"
  },
  {
    "name": "tbsnews.net",
    "url": "https://www.tbsnews.net/rss.xml",
    "region": "Bangladesh"
  },
  {
    "name": "dhakatribune.com",
    "url": "https://www.dhakatribune.com/feed/business",
    "region": "Bangladesh"
  },
  {
    "name": "newagebd.net",
    "url": "NO_RSS",
    "region": "Bangladesh"
  },
  {
    "name": "brusselstimes.com",
    "url": "https://www.brusselstimes.com/feed",
    "region": "Belgium"
  },
  {
    "name": "vrt.be",
    "url": "https://www.vrt.be/feed",
    "region": "Belgium"
  },
  {
    "name": "politico.eu",
    "url": "https://www.politico.eu/feed/",
    "region": "Belgium"
  },
  {
    "name": "xpats.com",
    "url": "https://www.xpats.com/rss.xml",
    "region": "Belgium"
  },
  {
    "name": "kuenselonline.com",
    "url": "https://kuenselonline.com/feed",
    "region": "Bhutan"
  },
  {
    "name": "thebhutanese.bt",
    "url": "https://thebhutanese.bt/feed/",
    "region": "Bhutan"
  },
  {
    "name": "businessbhutan.bt",
    "url": "https://businessbhutan.bt/feed/",
    "region": "Bhutan"
  },
  {
    "name": "riotimesonline.com",
    "url": "https://www.riotimesonline.com/feed/",
    "region": "Brazil"
  },
  {
    "name": "braziljournal.com",
    "url": "https://braziljournal.com/feed",
    "region": "Brazil"
  },
  {
    "name": "www1.folha.uol.com.br",
    "url": "https://www1.folha.uol.com.br/feed",
    "region": "Brazil"
  },
  {
    "name": "agenciabrasil.ebc.com.br",
    "url": "https://agenciabrasil.ebc.com.br/rss.xml",
    "region": "Brazil"
  },
  {
    "name": "valor.com.br",
    "url": "https://www.valor.com.br/rss",
    "region": "Brazil"
  },
  {
    "name": "khmertimeskh.com",
    "url": "NO_RSS",
    "region": "Cambodia"
  },
  {
    "name": "phnompenhpost.com",
    "url": "https://phnompenhpost.com/feed/",
    "region": "Cambodia"
  },
  {
    "name": "cambodiainvestmentreview.com",
    "url": "https://cambodiainvestmentreview.com/feed/",
    "region": "Cambodia"
  },
  {
    "name": "kiripost.com",
    "url": "https://www.kiripost.com/feed",
    "region": "Cambodia"
  },
  {
    "name": "financialpost.com",
    "url": "https://financialpost.com/rss",
    "region": "Canada"
  },
  {
    "name": "theglobeandmail.com",
    "url": "https://www.theglobeandmail.com/feed",
    "region": "Canada"
  },
  {
    "name": "bnnbloomberg.ca",
    "url": "https://www.bnnbloomberg.ca/feed",
    "region": "Canada"
  },
  {
    "name": "thestar.com",
    "url": "http://www.thestar.com/search/?f=rss&t=article&c=business&l=50&s=start_time&sd=desc",
    "region": "Canada"
  },
  {
    "name": "canadianbusiness.com",
    "url": "https://www.canadianbusiness.com/rss",
    "region": "Canada"
  },
  {
    "name": "caixinglobal.com",
    "url": "https://www.caixinglobal.com/feed",
    "region": "China"
  },
  {
    "name": "scmp.com",
    "url": "https://www.scmp.com/rss/92/feed",
    "region": "China"
  },
  {
    "name": "shine.cn",
    "url": "https://www.shine.cn/feed",
    "region": "China"
  },
  {
    "name": "chinadaily.com.cn",
    "url": "https://www.chinadaily.com.cn/feed",
    "region": "China"
  },
  {
    "name": "yicaiglobal.com",
    "url": "https://www.yicaiglobal.com/feed",
    "region": "China"
  },
  {
    "name": "total-croatia-news.com",
    "url": "https://total-croatia-news.com/feed/",
    "region": "Croatia"
  },
  {
    "name": "croatiaweek.com",
    "url": "https://www.croatiaweek.com/category/business/feed/",
    "region": "Croatia"
  },
  {
    "name": "n1info.hr",
    "url": "https://n1info.hr/feed",
    "region": "Croatia"
  },
  {
    "name": "havanatimes.org",
    "url": "https://havanatimes.org/rss",
    "region": "Cuba"
  },
  {
    "name": "oncubanews.com",
    "url": "https://oncubanews.com/rss",
    "region": "Cuba"
  },
  {
    "name": "en.granma.cu",
    "url": "https://en.granma.cu/feed",
    "region": "Cuba"
  },
  {
    "name": "cphpost.dk",
    "url": "https://cphpost.dk/feed",
    "region": "Denmark"
  },
  {
    "name": "thelocal.dk",
    "url": "https://feeds.thelocal.com/rss/dk",
    "region": "Denmark"
  },
  {
    "name": "scandasia.com",
    "url": "https://scandasia.com/feed/",
    "region": "Denmark"
  },
  {
    "name": "news.err.ee",
    "url": "https://news.err.ee/rss",
    "region": "Estonia"
  },
  {
    "name": "baltictimes.com",
    "url": "https://www.baltictimes.com/rss",
    "region": "Estonia"
  },
  {
    "name": "estonianworld.com",
    "url": "https://estonianworld.com/feed/",
    "region": "Estonia"
  },
  {
    "name": "investinestonia.com",
    "url": "https://investinestonia.com/feed",
    "region": "Estonia"
  },
  {
    "name": "yle.fi",
    "url": "https://yle.fi/feed",
    "region": "Finland"
  },
  {
    "name": "helsinkitimes.fi",
    "url": "https://www.helsinkitimes.fi/feed",
    "region": "Finland"
  },
  {
    "name": "goodnewsfinland.com",
    "url": "https://www.goodnewsfinland.com/feed",
    "region": "Finland"
  },
  {
    "name": "dailyfinland.fi",
    "url": "https://www.dailyfinland.fi/feed",
    "region": "Finland"
  },
  {
    "name": "france24.com",
    "url": "https://www.france24.com/en/business-tech/rss",
    "region": "France"
  },
  {
    "name": "rfi.fr",
    "url": "https://www.rfi.fr/rss",
    "region": "France"
  },
  {
    "name": "thelocal.fr",
    "url": "https://feeds.thelocal.com/rss/fr",
    "region": "France"
  },
  {
    "name": "lemonde.fr",
    "url": "https://www.lemonde.fr/feed",
    "region": "France"
  },
  {
    "name": "frenchtechjournal.com",
    "url": "https://www.frenchtechjournal.com/latest/rss/",
    "region": "France"
  },
  {
    "name": "civil.ge",
    "url": "https://civil.ge/rss",
    "region": "Georgia"
  },
  {
    "name": "agenda.ge",
    "url": "https://agenda.ge/feed",
    "region": "Georgia"
  },
  {
    "name": "financial.ge",
    "url": "https://www.financial.ge/feed",
    "region": "Georgia"
  },
  {
    "name": "georgiatoday.ge",
    "url": "http://georgiatoday.ge/feed",
    "region": "Georgia"
  },
  {
    "name": "bm.ge",
    "url": "NO_RSS",
    "region": "Georgia"
  },
  {
    "name": "handelsblatt.com",
    "url": "https://www.handelsblatt.com/contentexport/feed/rss/schlagzeilen",
    "region": "Germany"
  },
  {
    "name": "dw.com",
    "url": "https://www.dw.com/feed",
    "region": "Germany"
  },
  {
    "name": "thelocal.de",
    "url": "NO_RSS",
    "region": "Germany"
  },
  {
    "name": "cleanenergywire.org",
    "url": "https://www.cleanenergywire.org/rss.xml",
    "region": "Germany"
  },
  {
    "name": "munich-startup.de",
    "url": "https://www.munich-startup.de/feed",
    "region": "Germany"
  },
  {
    "name": "graphic.com.gh",
    "url": "https://www.graphic.com.gh/business.feed?type=rss",
    "region": "Ghana"
  },
  {
    "name": "citibusinessnews.com",
    "url": "https://citibusinessnews.com/feed",
    "region": "Ghana"
  },
  {
    "name": "thebftonline.com",
    "url": "https://thebftonline.com/feed/",
    "region": "Ghana"
  },
  {
    "name": "myjoyonline.com",
    "url": "https://www.myjoyonline.com/feed/",
    "region": "Ghana"
  },
  {
    "name": "ghanaweb.com",
    "url": "https://www.ghanaweb.com/feed",
    "region": "Ghana"
  },
  {
    "name": "ekathimerini.com",
    "url": "https://www.ekathimerini.com/feed",
    "region": "Greece"
  },
  {
    "name": "naftemporiki.gr",
    "url": "https://www.naftemporiki.gr/feed/",
    "region": "Greece"
  },
  {
    "name": "greekreporter.com",
    "url": "https://greekreporter.com/feed/",
    "region": "Greece"
  },
  {
    "name": "capital.gr",
    "url": "https://www.capital.gr/rss",
    "region": "Greece"
  },
  {
    "name": "businessinguinea.com",
    "url": "https://www.businessinguinea.com/feed",
    "region": "Guinea"
  },
  {
    "name": "mining.com",
    "url": "https://www.mining.com/rss",
    "region": "Guinea"
  },
  {
    "name": "bbj.hu",
    "url": "https://bbj.hu/feed",
    "region": "Hungary"
  },
  {
    "name": "portfolio.hu",
    "url": "https://www.portfolio.hu/en/rss/all.xml",
    "region": "Hungary"
  },
  {
    "name": "hungarytoday.hu",
    "url": "https://hungarytoday.hu/rss",
    "region": "Hungary"
  },
  {
    "name": "dailynewshungary.com",
    "url": "https://dailynewshungary.com/feed/",
    "region": "Hungary"
  },
  {
    "name": "icelandmonitor.mbl.is",
    "url": "https://icelandmonitor.mbl.is/rss",
    "region": "Iceland"
  },
  {
    "name": "icelandreview.com",
    "url": "https://www.icelandreview.com/rss",
    "region": "Iceland"
  },
  {
    "name": "businessiceland.is",
    "url": "https://www.businessiceland.is/feed",
    "region": "Iceland"
  },
  {
    "name": "northstack.is",
    "url": "https://www.northstack.is/rss/",
    "region": "Iceland"
  },
  {
    "name": "economictimes.indiatimes.com",
    "url": "https://economictimes.indiatimes.com/feed",
    "region": "India"
  },
  {
    "name": "livemint.com",
    "url": "https://www.livemint.com/feed",
    "region": "India"
  },
  {
    "name": "business-standard.com",
    "url": "https://www.business-standard.com/feed",
    "region": "India"
  },
  {
    "name": "moneycontrol.com",
    "url": "https://www.moneycontrol.com/rss/latestnews.xml",
    "region": "India"
  },
  {
    "name": "thehindubusinessline.com",
    "url": "https://www.thehindubusinessline.com/feeder/default.rss",
    "region": "India"
  },
  {
    "name": "thejakartapost.com",
    "url": "https://www.thejakartapost.com/feed",
    "region": "Indonesia"
  },
  {
    "name": "jakartaglobe.id",
    "url": "https://jakartaglobe.id/feed",
    "region": "Indonesia"
  },
  {
    "name": "en.tempo.co",
    "url": "NO_RSS",
    "region": "Indonesia"
  },
  {
    "name": "en.antaranews.com",
    "url": "https://en.antaranews.com/feed",
    "region": "Indonesia"
  },
  {
    "name": "dinsights.katadata.co.id",
    "url": "https://dinsights.katadata.co.id/feed",
    "region": "Indonesia"
  },
  {
    "name": "tehrantimes.com",
    "url": "https://www.tehrantimes.com/rss",
    "region": "Iran"
  },
  {
    "name": "financialtribune.com",
    "url": "https://financialtribune.com/rss.xml",
    "region": "Iran"
  },
  {
    "name": "en.mehrnews.com",
    "url": "https://en.mehrnews.com/feed",
    "region": "Iran"
  },
  {
    "name": "presstv.ir",
    "url": "https://www.presstv.ir/rss.xml",
    "region": "Iran"
  },
  {
    "name": "rte.ie",
    "url": "https://www.rte.ie/feeds/rss/?index=/news/business/",
    "region": "Ireland"
  },
  {
    "name": "irishtimes.com",
    "url": "https://www.irishtimes.com/feed",
    "region": "Ireland"
  },
  {
    "name": "businesspost.ie",
    "url": "NO_RSS",
    "region": "Ireland"
  },
  {
    "name": "siliconrepublic.com",
    "url": "https://www.siliconrepublic.com/feed",
    "region": "Ireland"
  },
  {
    "name": "independent.ie",
    "url": "https://www.independent.ie/rss",
    "region": "Ireland"
  },
  {
    "name": "en.globes.co.il",
    "url": "https://en.globes.co.il/WebService/RssFeed.asmx",
    "region": "Israel"
  },
  {
    "name": "calcalistech.com",
    "url": "https://www.calcalistech.com/feed",
    "region": "Israel"
  },
  {
    "name": "haaretz.com",
    "url": "https://www.haaretz.com/feed",
    "region": "Israel"
  },
  {
    "name": "jpost.com",
    "url": "https://www.jpost.com/feed",
    "region": "Israel"
  },
  {
    "name": "timesofisrael.com",
    "url": "https://www.timesofisrael.com/feed",
    "region": "Israel"
  },
  {
    "name": "ansa.it",
    "url": "https://www.ansa.it/rss.xml",
    "region": "Italy"
  },
  {
    "name": "24plus.ilsole24ore.com",
    "url": "https://24plus.ilsole24ore.com/feed",
    "region": "Italy"
  },
  {
    "name": "thelocal.it",
    "url": "https://feeds.thelocal.com/rss/it",
    "region": "Italy"
  },
  {
    "name": "milanofinanza.it",
    "url": "NO_RSS",
    "region": "Italy"
  },
  {
    "name": "asia.nikkei.com",
    "url": "https://asia.nikkei.com/feed",
    "region": "Japan"
  },
  {
    "name": "japantimes.co.jp",
    "url": "https://www.japantimes.co.jp/feed/topstories/",
    "region": "Japan"
  },
  {
    "name": "english.kyodonews.net",
    "url": "https://english.kyodonews.net/rss/all.xml",
    "region": "Japan"
  },
  {
    "name": "asahi.com",
    "url": "https://www.asahi.com/feed",
    "region": "Japan"
  },
  {
    "name": "japantoday.com",
    "url": "https://japantoday.com/category/business/feed",
    "region": "Japan"
  },
  {
    "name": "luxtimes.lu",
    "url": "https://www.luxtimes.lu/rss",
    "region": "Luxembourg"
  },
  {
    "name": "chronicle.lu",
    "url": "NO_RSS",
    "region": "Luxembourg"
  },
  {
    "name": "delano.lu",
    "url": "NO_RSS",
    "region": "Luxembourg"
  },
  {
    "name": "theedgemalaysia.com",
    "url": "https://theedgemalaysia.com/feed",
    "region": "Malaysia"
  },
  {
    "name": "thestar.com.my",
    "url": "https://www.thestar.com.my/feed",
    "region": "Malaysia"
  },
  {
    "name": "nst.com.my",
    "url": "https://www.nst.com.my/feed",
    "region": "Malaysia"
  },
  {
    "name": "malaymail.com",
    "url": "https://www.malaymail.com/feed",
    "region": "Malaysia"
  },
  {
    "name": "freemalaysiatoday.com",
    "url": "https://www.freemalaysiatoday.com/feed",
    "region": "Malaysia"
  },
  {
    "name": "edition.mv",
    "url": "https://edition.mv/feed",
    "region": "Maldives"
  },
  {
    "name": "mfr.mv",
    "url": "https://mfr.mv/feed",
    "region": "Maldives"
  },
  {
    "name": "corporatemaldives.com",
    "url": "https://corporatemaldives.com/feed/",
    "region": "Maldives"
  },
  {
    "name": "mexiconewsdaily.com",
    "url": "https://mexiconewsdaily.com/rss",
    "region": "Mexico"
  },
  {
    "name": "bnamericas.com",
    "url": "NO_RSS",
    "region": "Mexico"
  },
  {
    "name": "mexicobusiness.news",
    "url": "https://mexicobusiness.news/feed",
    "region": "Mexico"
  },
  {
    "name": "eluniversal.com.mx",
    "url": "http://www.eluniversal.com.mx/rss/finanzas.xml",
    "region": "Mexico"
  },
  {
    "name": "monacolife.net",
    "url": "https://monacolife.net/rss",
    "region": "Monaco"
  },
  {
    "name": "news.mc",
    "url": "https://news.mc/feed/",
    "region": "Monaco"
  },
  {
    "name": "gnlm.com.mm",
    "url": "https://www.gnlm.com.mm/feed/",
    "region": "Myanmar"
  },
  {
    "name": "irrawaddy.com",
    "url": "https://www.irrawaddy.com/feed",
    "region": "Myanmar"
  },
  {
    "name": "frontiermyanmar.net",
    "url": "https://www.frontiermyanmar.net/en/category/business/feed/",
    "region": "Myanmar"
  },
  {
    "name": "kathmandupost.com",
    "url": "https://kathmandupost.com/rss",
    "region": "Nepal"
  },
  {
    "name": "thehimalayantimes.com",
    "url": "https://thehimalayantimes.com/feed",
    "region": "Nepal"
  },
  {
    "name": "newbusinessage.com",
    "url": "https://newbusinessage.com/feed/",
    "region": "Nepal"
  },
  {
    "name": "english.onlinekhabar.com",
    "url": "https://english.onlinekhabar.com/rss",
    "region": "Nepal"
  },
  {
    "name": "dutchnews.nl",
    "url": "https://www.dutchnews.nl/feed",
    "region": "Netherlands"
  },
  {
    "name": "nltimes.nl",
    "url": "https://nltimes.nl/rss",
    "region": "Netherlands"
  },
  {
    "name": "iamexpat.nl",
    "url": "NO_RSS",
    "region": "Netherlands"
  },
  {
    "name": "fd.nl",
    "url": "?rss",
    "region": "Netherlands"
  },
  {
    "name": "nzherald.co.nz",
    "url": "https://www.nzherald.co.nz/feed",
    "region": "New Zealand"
  },
  {
    "name": "stuff.co.nz",
    "url": "https://www.stuff.co.nz/feed",
    "region": "New Zealand"
  },
  {
    "name": "nbr.co.nz",
    "url": "https://www.nbr.co.nz/feed",
    "region": "New Zealand"
  },
  {
    "name": "interest.co.nz",
    "url": "https://www.interest.co.nz/rss",
    "region": "New Zealand"
  },
  {
    "name": "businessdesk.co.nz",
    "url": "https://businessdesk.co.nz/feed",
    "region": "New Zealand"
  },
  {
    "name": "businessday.ng",
    "url": "https://businessday.ng/feed/",
    "region": "Nigeria"
  },
  {
    "name": "nairametrics.com",
    "url": "https://nairametrics.com/feed/",
    "region": "Nigeria"
  },
  {
    "name": "guardian.ng",
    "url": "https://guardian.ng/category/business-services/feed/",
    "region": "Nigeria"
  },
  {
    "name": "vanguardngr.com",
    "url": "https://www.vanguardngr.com/rss",
    "region": "Nigeria"
  },
  {
    "name": "proshareng.com",
    "url": "https://www.proshareng.com/feed",
    "region": "Nigeria"
  },
  {
    "name": "dn.no",
    "url": "https://www.dn.no/rss",
    "region": "Norway"
  },
  {
    "name": "newsinenglish.no",
    "url": "https://www.newsinenglish.no/feed/",
    "region": "Norway"
  },
  {
    "name": "thelocal.no",
    "url": "https://feeds.thelocal.com/rss/no",
    "region": "Norway"
  },
  {
    "name": "e24.no",
    "url": "https://e24.no/rss",
    "region": "Norway"
  },
  {
    "name": "brecorder.com",
    "url": "https://www.brecorder.com/rss",
    "region": "Pakistan"
  },
  {
    "name": "dawn.com",
    "url": "https://www.dawn.com/feed",
    "region": "Pakistan"
  },
  {
    "name": "profit.pakistantoday.com.pk",
    "url": "https://profit.pakistantoday.com.pk/feed/",
    "region": "Pakistan"
  },
  {
    "name": "thenews.com.pk",
    "url": "https://www.thenews.com.pk/feed",
    "region": "Pakistan"
  },
  {
    "name": "propakistani.pk",
    "url": "https://propakistani.pk/feed",
    "region": "Pakistan"
  },
  {
    "name": "bworldonline.com",
    "url": "https://www.bworldonline.com/feed",
    "region": "Philippines"
  },
  {
    "name": "philstar.com",
    "url": "https://www.philstar.com/feed",
    "region": "Philippines"
  },
  {
    "name": "business.inquirer.net",
    "url": "https://business.inquirer.net/feed",
    "region": "Philippines"
  },
  {
    "name": "rappler.com",
    "url": "https://www.rappler.com/feed/",
    "region": "Philippines"
  },
  {
    "name": "mb.com.ph",
    "url": "https://mb.com.ph/rss-feed",
    "region": "Philippines"
  },
  {
    "name": "thefirstnews.com",
    "url": "https://www.thefirstnews.com/feed",
    "region": "Poland"
  },
  {
    "name": "notesfrompoland.com",
    "url": "https://notesfrompoland.com/feed/",
    "region": "Poland"
  },
  {
    "name": "tvpworld.com",
    "url": "NO_RSS",
    "region": "Poland"
  },
  {
    "name": "wbj.pl",
    "url": "https://wbj.pl/feed",
    "region": "Poland"
  },
  {
    "name": "theportugalnews.com",
    "url": "NO_RSS",
    "region": "Portugal"
  },
  {
    "name": "echoboomer.pt",
    "url": "https://echoboomer.pt/feed",
    "region": "Portugal"
  },
  {
    "name": "portugalresident.com",
    "url": "https://www.portugalresident.com/rss",
    "region": "Portugal"
  },
  {
    "name": "thepeninsulaqatar.com",
    "url": "https://thepeninsulaqatar.com/feed",
    "region": "Qatar"
  },
  {
    "name": "gulf-times.com",
    "url": "NO_RSS",
    "region": "Qatar"
  },
  {
    "name": "qatar-tribune.com",
    "url": "NO_RSS",
    "region": "Qatar"
  },
  {
    "name": "dohanews.co",
    "url": "https://dohanews.co/rss",
    "region": "Qatar"
  },
  {
    "name": "romania-insider.com",
    "url": "https://www.romania-insider.com/feed",
    "region": "Romania"
  },
  {
    "name": "business-review.eu",
    "url": "https://business-review.eu/feed",
    "region": "Romania"
  },
  {
    "name": "romaniajournal.ro",
    "url": "https://www.romaniajournal.ro/feed/",
    "region": "Romania"
  },
  {
    "name": "nineoclock.ro",
    "url": "https://www.nineoclock.ro/feed/",
    "region": "Romania"
  },
  {
    "name": "themoscowtimes.com",
    "url": "https://www.themoscowtimes.com/feed",
    "region": "Russia"
  },
  {
    "name": "tass.com",
    "url": "https://tass.com/feed",
    "region": "Russia"
  },
  {
    "name": "interfax.com",
    "url": "https://interfax.com/feed",
    "region": "Russia"
  },
  {
    "name": "intellinews.com",
    "url": "NO_RSS",
    "region": "Russia"
  },
  {
    "name": "arabnews.com",
    "url": "https://www.arabnews.com/rss",
    "region": "Saudi Arabia"
  },
  {
    "name": "saudigazette.com.sa",
    "url": "https://saudigazette.com.sa/rssFeed/74",
    "region": "Saudi Arabia"
  },
  {
    "name": "argaam.com",
    "url": "https://www.argaam.com/feed",
    "region": "Saudi Arabia"
  },
  {
    "name": "zawya.com",
    "url": "https://www.zawya.com/sitemaps/en/rss",
    "region": "Saudi Arabia"
  },
  {
    "name": "businesstimes.com.sg",
    "url": "https://www.businesstimes.com.sg/feed",
    "region": "Singapore"
  },
  {
    "name": "straitstimes.com",
    "url": "https://www.straitstimes.com/news/business/rss.xml",
    "region": "Singapore"
  },
  {
    "name": "channelnewsasia.com",
    "url": "https://www.channelnewsasia.com/feed",
    "region": "Singapore"
  },
  {
    "name": "sbr.com.sg",
    "url": "https://sbr.com.sg/feed",
    "region": "Singapore"
  },
  {
    "name": "dealstreetasia.com",
    "url": "https://www.dealstreetasia.com/feed",
    "region": "Singapore"
  },
  {
    "name": "businesslive.co.za",
    "url": "https://www.businesslive.co.za/feed",
    "region": "South Africa"
  },
  {
    "name": "news24.com",
    "url": "https://feeds.24.com/articles/business/topstories/rss",
    "region": "South Africa"
  },
  {
    "name": "moneyweb.co.za",
    "url": "https://www.moneyweb.co.za/feed",
    "region": "South Africa"
  },
  {
    "name": "dailymaverick.co.za",
    "url": "https://www.dailymaverick.co.za/feed",
    "region": "South Africa"
  },
  {
    "name": "engineeringnews.co.za",
    "url": "https://www.engineeringnews.co.za/feeds/latest-news.xml",
    "region": "South Africa"
  },
  {
    "name": "en.yna.co.kr",
    "url": "https://en.yna.co.kr/RSS/news.xml",
    "region": "South Korea"
  },
  {
    "name": "koreaherald.com",
    "url": "https://www.koreaherald.com/rss/newsAll",
    "region": "South Korea"
  },
  {
    "name": "pulsenews.co.kr",
    "url": "https://pulsenews.co.kr/feed",
    "region": "South Korea"
  },
  {
    "name": "koreajoongangdaily.joins.com",
    "url": "https://feeds.buzzsprout.com/1701220.rss",
    "region": "South Korea"
  },
  {
    "name": "koreatimes.co.kr",
    "url": "https://feed.koreatimes.co.kr/k/allnews.xml",
    "region": "South Korea"
  },
  {
    "name": "english.elpais.com",
    "url": "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/in-english",
    "region": "Spain"
  },
  {
    "name": "thelocal.es",
    "url": "https://feeds.thelocal.com/rss/es",
    "region": "Spain"
  },
  {
    "name": "surinenglish.com",
    "url": "NO_RSS",
    "region": "Spain"
  },
  {
    "name": "merca2.es",
    "url": "https://www.merca2.es/feed",
    "region": "Spain"
  },
  {
    "name": "ft.lk",
    "url": "https://www.ft.lk/feed",
    "region": "Sri Lanka"
  },
  {
    "name": "lankabusinessonline.com",
    "url": "https://www.lankabusinessonline.com/feed/",
    "region": "Sri Lanka"
  },
  {
    "name": "economynext.com",
    "url": "https://economynext.com/feed/",
    "region": "Sri Lanka"
  },
  {
    "name": "island.lk",
    "url": "http://island.lk/feed/",
    "region": "Sri Lanka"
  },
  {
    "name": "thelocal.se",
    "url": "https://www.thelocal.se/feed/",
    "region": "Sweden"
  },
  {
    "name": "di.se",
    "url": "https://www.di.se/feed",
    "region": "Sweden"
  },
  {
    "name": "stjernan.se",
    "url": "https://www.stjernan.se/feed",
    "region": "Sweden"
  },
  {
    "name": "investstockholm.com",
    "url": "https://www.investstockholm.com/feed",
    "region": "Sweden"
  },
  {
    "name": "swissinfo.ch",
    "url": "https://www.swissinfo.ch/feed",
    "region": "Switzerland"
  },
  {
    "name": "thelocal.ch",
    "url": "https://feeds.thelocal.com/rss/ch",
    "region": "Switzerland"
  },
  {
    "name": "finews.com",
    "url": "https://www.finews.com/news/english-news?format=feed&type=rss",
    "region": "Switzerland"
  },
  {
    "name": "genevasolutions.news",
    "url": "https://genevasolutions.news/feed",
    "region": "Switzerland"
  },
  {
    "name": "sana.sy",
    "url": "https://sana.sy/en/?feed=rss2",
    "region": "Syria"
  },
  {
    "name": "english.enabbaladi.net",
    "url": "https://english.enabbaladi.net/archives/category/economy/feed/",
    "region": "Syria"
  },
  {
    "name": "syria-report.com",
    "url": "https://www.syria-report.com/feed",
    "region": "Syria"
  },
  {
    "name": "taipeitimes.com",
    "url": "https://www.taipeitimes.com/feed",
    "region": "Taiwan"
  },
  {
    "name": "focustaiwan.tw",
    "url": "https://focustaiwan.tw/feed",
    "region": "Taiwan"
  },
  {
    "name": "taiwannews.com.tw",
    "url": "https://www.taiwannews.com.tw/feed",
    "region": "Taiwan"
  },
  {
    "name": "digitimes.com",
    "url": "https://www.digitimes.com/rss/daily.xml",
    "region": "Taiwan"
  },
  {
    "name": "bangkokpost.com",
    "url": "https://www.bangkokpost.com/rss",
    "region": "Thailand"
  },
  {
    "name": "nationthailand.com",
    "url": "https://www.nationthailand.com/feed",
    "region": "Thailand"
  },
  {
    "name": "thaienquirer.com",
    "url": "https://www.thaienquirer.com/feed/",
    "region": "Thailand"
  },
  {
    "name": "dailysabah.com",
    "url": "https://www.dailysabah.com/rss",
    "region": "Turkey"
  },
  {
    "name": "hurriyetdailynews.com",
    "url": "https://www.hurriyetdailynews.com/rss",
    "region": "Turkey"
  },
  {
    "name": "aa.com.tr",
    "url": "https://www.aa.com.tr/en/rss/",
    "region": "Turkey"
  },
  {
    "name": "duvarenglish.com",
    "url": "https://www.duvarenglish.com/feed",
    "region": "Turkey"
  },
  {
    "name": "kyivindependent.com",
    "url": "https://kyivindependent.com/feed",
    "region": "Ukraine"
  },
  {
    "name": "en.interfax.com.ua",
    "url": "https://en.interfax.com.ua/feed",
    "region": "Ukraine"
  },
  {
    "name": "ukrinform.net",
    "url": "https://www.ukrinform.net/rss//rubric-economy",
    "region": "Ukraine"
  },
  {
    "name": "ubn.news",
    "url": "NO_RSS",
    "region": "Ukraine"
  },
  {
    "name": "thenationalnews.com",
    "url": "https://www.thenationalnews.com/business/rss",
    "region": "UAE"
  },
  {
    "name": "gulfnews.com",
    "url": "https://gulfnews.com/feed",
    "region": "UAE"
  },
  {
    "name": "khaleejtimes.com",
    "url": "NO_RSS",
    "region": "UAE"
  },
  {
    "name": "arabianbusiness.com",
    "url": "https://www.arabianbusiness.com/feed",
    "region": "UAE"
  },
  {
    "name": "wam.ae",
    "url": "https://www.wam.ae/feed",
    "region": "UAE"
  },
  {
    "name": "ft.com",
    "url": "NO_RSS",
    "region": "United Kingdom"
  },
  {
    "name": "cityam.com",
    "url": "https://www.cityam.com/feed/",
    "region": "United Kingdom"
  },
  {
    "name": "telegraph.co.uk",
    "url": "https://www.telegraph.co.uk/feed",
    "region": "United Kingdom"
  },
  {
    "name": "bbc.com",
    "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "region": "United Kingdom"
  },
  {
    "name": "reuters.com",
    "url": "NO_RSS",
    "region": "United Kingdom"
  },
  {
    "name": "wsj.com",
    "url": "NO_RSS",
    "region": "United States"
  },
  {
    "name": "bloomberg.com",
    "url": "https://feeds.bloomberg.com/markets/news.rss",
    "region": "United States"
  },
  {
    "name": "cnbc.com",
    "url": "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    "region": "United States"
  },
  {
    "name": "forbes.com",
    "url": "https://www.forbes.com/feed",
    "region": "United States"
  },
  {
    "name": "businessinsider.com",
    "url": "https://feeds.businessinsider.com/custom/all",
    "region": "United States"
  },
  {
    "name": "vaticannews.va",
    "url": "https://www.vaticannews.va/en.rss.xml",
    "region": "Vatican City"
  },
  {
    "name": "e.vnexpress.net",
    "url": "https://e.vnexpress.net/feed",
    "region": "Vietnam"
  },
  {
    "name": "vietnamnews.vn",
    "url": "https://vietnamnews.vn/feed",
    "region": "Vietnam"
  },
  {
    "name": "vir.com.vn",
    "url": "https://vir.com.vn/rss_feed/",
    "region": "Vietnam"
  },
  {
    "name": "english.thesaigontimes.vn",
    "url": "https://english.thesaigontimes.vn/feed/",
    "region": "Vietnam"
  },
  {
    "name": "tuoitrenews.vn",
    "url": "https://tuoitre.vn/rss.htm",
    "region": "Vietnam"
  },
  {
    "name": "economist.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "hbr.org",
    "url": "https://hbr.org/feed",
    "region": "International"
  },
  {
    "name": "fortune.com",
    "url": "https://fortune.com/feed",
    "region": "International"
  },
  {
    "name": "barrons.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "qz.com",
    "url": "https://qz.com/feed",
    "region": "International"
  },
  {
    "name": "project-syndicate.org",
    "url": "https://www.project-syndicate.org/feed",
    "region": "International"
  },
  {
    "name": "marketwatch.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "techcrunch.com",
    "url": "https://techcrunch.com/feed/",
    "region": "International"
  },
  {
    "name": "theafricareport.com",
    "url": "https://www.theafricareport.com/feed/",
    "region": "International"
  },
  {
    "name": "african.business",
    "url": "https://african.business/feed/",
    "region": "International"
  },
  {
    "name": "meed.com",
    "url": "https://www.meed.com/feed",
    "region": "International"
  },
  {
    "name": "thediplomat.com",
    "url": "https://thediplomat.com/feed",
    "region": "International"
  },
  {
    "name": "euronews.com",
    "url": "https://www.euronews.com/feed",
    "region": "International"
  },
  {
    "name": "inc.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "fastcompany.com",
    "url": "https://www.fastcompany.com/latest/rss",
    "region": "International"
  },
  {
    "name": "entrepreneur.com",
    "url": "https://www.entrepreneur.com/feed",
    "region": "International"
  },
  {
    "name": "technologyreview.com",
    "url": "https://www.technologyreview.com/feed",
    "region": "International"
  },
  {
    "name": "seekingalpha.com",
    "url": "https://seekingalpha.com/feed",
    "region": "International"
  },
  {
    "name": "theinformation.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "venturebeat.com",
    "url": "https://venturebeat.com/feed/",
    "region": "International"
  },
  {
    "name": "coindesk.com",
    "url": "https://www.coindesk.com/feed",
    "region": "International"
  },
  {
    "name": "oilprice.com",
    "url": "https://oilprice.com/rss.xml",
    "region": "International"
  },
  {
    "name": "weforum.org",
    "url": "https://www.weforum.org/feed",
    "region": "International"
  },
  {
    "name": "foreignaffairs.com",
    "url": "https://www.foreignaffairs.com/rss.xml",
    "region": "International"
  },
  {
    "name": "sifted.eu",
    "url": "https://sifted.eu/feed",
    "region": "International"
  },
  {
    "name": "dealstreetasia.com",
    "url": "https://www.dealstreetasia.com/feed",
    "region": "International"
  },
  {
    "name": "businessoffashion.com",
    "url": "https://www.businessoffashion.com/arc/outboundfeeds/rss/",
    "region": "International"
  },
  {
    "name": "skift.com",
    "url": "https://skift.com/feed",
    "region": "International"
  },
  {
    "name": "morningstar.com",
    "url": "https://www.morningstar.com/feed",
    "region": "International"
  },
  {
    "name": "investopedia.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "ibtimes.com",
    "url": "https://www.ibtimes.com/rss",
    "region": "International"
  },
  {
    "name": "yicaiglobal.com",
    "url": "https://www.yicaiglobal.com/feed",
    "region": "International"
  },
  {
    "name": "intellinews.com",
    "url": "https://www.intellinews.com/feed/",
    "region": "International"
  },
  {
    "name": "thebanker.com",
    "url": "https://www.thebanker.com/feed",
    "region": "International"
  },
  {
    "name": "pionline.com",
    "url": "https://www.pionline.com/feed",
    "region": "International"
  },
  {
    "name": "institutionalinvestor.com",
    "url": "https://www.institutionalinvestor.com/rss.xml",
    "region": "International"
  },
  {
    "name": "privateequityinternational.com",
    "url": "https://www.privateequityinternational.com/feed",
    "region": "International"
  },
  {
    "name": "variety.com",
    "url": "https://variety.com/rss",
    "region": "International"
  },
  {
    "name": "adage.com",
    "url": "https://adage.com/feed",
    "region": "International"
  },
  {
    "name": "thestreet.com",
    "url": "NO_RSS",
    "region": "International"
  },
  {
    "name": "WSJ Business",
    "url": "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
    "region": "United States"
  },
  {
    "name": "Bloomberg",
    "url": "https://feeds.bloomberg.com/markets/news.rss",
    "region": "United States"
  },
  {
    "name": "Financial Times",
    "url": "https://www.ft.com/?format=rss",
    "region": "United Kingdom"
  },
  {
    "name": "SCMP Economy",
    "url": "https://www.scmp.com/rss/91/feed",
    "region": "Asia-Pacific"
  },
  {
    "name": "CNBC",
    "url": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    "region": "United States"
  },
  {
    "name": "Prothom Alo",
    "url": "https://en.prothomalo.com/feed",
    "region": "Bangladesh"
  },
  {
    "name": "bdnews24",
    "url": "https://bdnews24.com/business/?widgetName=rssfeed&widgetId=1150&getXml=1",
    "region": "Bangladesh"
  },
  {
    "name": "The Business Standard",
    "url": "https://www.tbsnews.net/rss.xml",
    "region": "Bangladesh"
  },
  {
    "name": "Economic Times",
    "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    "region": "India"
  },
  {
    "name": "Straits Times",
    "url": "https://www.straitstimes.com/news/business/rss.xml",
    "region": "Asia-Pacific"
  },
  {
    "name": "UN News",
    "url": "https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml",
    "region": "Global"
  },
  {
    "name": "The Diplomat",
    "url": "https://thediplomat.com/feed/",
    "region": "Asia-Pacific"
  },
  {
    "name": "BBC Business",
    "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "region": "United Kingdom"
  },
  {
    "name": "Al Jazeera Economy",
    "url": "https://www.aljazeera.com/xml/rss/all.xml",
    "region": "Global"
  },
  {
    "name": "DW Business",
    "url": "https://rss.dw.com/xml/rss-en-bus",
    "region": "Global"
  }
];
module.exports = sources;
