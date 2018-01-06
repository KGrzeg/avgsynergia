// ==UserScript==
// @name               Librus Srednia
// @namespace          http://kgrzeg.pl/
// @homepage           http://kgrzeg.pl/
// @homepageURL        http://kgrzeg.pl/
// @description        Automatyczne liczenie średniej ocen na portalu synergia.librus.pl z uwzględnieniem wag dla uczniów szkół, które wyłączyły tę funkcjonalność
// @author             Grzegorz Kupczyk

// @version            0.2
// @downloadURL        https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/dist/tamper.user.js
// @updateURL          https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/dist/tamper.user.js
// @supportURL         https://github.com/GrzegorzKu/avgsynergia/issues

// @require            https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require            https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @icon64             https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/images/logo.png
// @icon64URL          https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/images/logo.png

// @resource floating  https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/dist/floating.html
// @resource css       https://raw.githubusercontent.com/GrzegorzKu/avgsynergia/master/dist/style.css

// @match              https://synergia.librus.pl/przegladaj_oceny/uczen

// @grant              GM_getResourceText
// @grant              GM_addStyle
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
  /* jshint ignore:end */
  /* jshint esnext: false */
  /* jshint esversion: 6 */
  /* jshint asi: true */

  /* ::WeightedAverage:: */
  /* ::Mark:: */
  /* ::Subject:: */
  /* ::Controller:: */

  $(function(){
    var css = GM_getResourceText("css")
    var floating = GM_getResourceText("floating")

    GM_addStyle( css )
    $(document.body).append( $.parseHTML( floating ))

    var ctrl = new Controller()

    console.log("Automatyczne liczenie średniej możliwe dzięki %cGrzesiowi Kupczyk %c;)", "color:yellowgreen", "color:inherit");
  })

/* jshint ignore:start */
]]></>).toString();
var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
eval(c.code);
/* jshint ignore:end */