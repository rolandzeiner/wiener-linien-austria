// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var s,n=arguments.length,o=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(n<3?s(o):n>3?s(t,i,o):s(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=s.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new n(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,f=g?g.emptyScript:"",m=_.reactiveElementPolyfillSupport,b=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:s}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const n=r?.call(this);s?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),s=t.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=r;const n=s.fromAttribute(t,e.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(e,t,i,r=!1,s){if(void 0!==e){const n=this.constructor;if(!1===r&&(s=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??w)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==s||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,m?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,A=$.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,R=`<${C}>`,L=document,T=()=>L.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,M="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,B=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,W=/"/g,q=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),K=new WeakMap,V=L.createTreeWalker(L,129);function G(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let s,n=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===O?"!--"===l[1]?o=H:void 0!==l[1]?o=N:void 0!==l[2]?(q.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=B):void 0!==l[3]&&(o=B):o===B?">"===l[0]?(o=s??O,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?B:'"'===l[3]?W:U):o===W||o===U?o=B:o===H||o===N?o=O:(o=B,s=void 0);const h=o===B&&e[t+1].startsWith("/>")?" ":"";n+=o===O?i+R:c>=0?(r.push(a),i.slice(0,c)+z+i.slice(c)+E+h):i+E+(-2===c?t:h)}return[G(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class J{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let s=0,n=0;const o=e.length-1,a=this.parts,[l,c]=Z(e,t);if(this.el=J.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=V.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=c[n++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:s}),r.removeAttribute(e));if(q.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],T()),V.nextNode(),a.push({type:2,index:++s});r.append(e[t],T())}}}else if(8===r.nodeType)if(r.data===C)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)a.push({type:7,index:s}),e+=E.length-1}s++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,r){if(t===F)return t;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const n=P(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(e),s._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(t=Y(e,s._$AS(e,t.values),s,r)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??L).importNode(t,!0);V.currentNode=r;let s=V.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new Q(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new se(s,this,e)),this._$AV.push(t),a=i[++o]}n!==a?.index&&(s=V.nextNode(),n++)}return V.currentNode=L,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),P(e)?e===I||null==e||""===e?(this._$AH!==I&&this._$AR(),this._$AH=I):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==I&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new X(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=K.get(e.strings);return void 0===t&&K.set(e.strings,t=new J(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const s of e)r===t.length?t.push(i=new Q(this.O(T()),this.O(T()),this,this.options)):i=t[r],i._$AI(s),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,s){this.type=1,this._$AH=I,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}_$AI(e,t=this,i,r){const s=this.strings;let n=!1;if(void 0===s)e=Y(this,e,t,0),n=!P(e)||e!==this._$AH&&e!==F,n&&(this._$AH=e);else{const r=e;let o,a;for(e=s[0],o=0;o<s.length-1;o++)a=Y(this,r[i+o],t,o),a===F&&(a=this._$AH[o]),n||=!P(a)||a!==this._$AH[o],a===I?e=I:e!==I&&(e+=(a??"")+s[o+1]),this._$AH[o]=a}n&&!r&&this.j(e)}j(e){e===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===I?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==I)}}class re extends ee{constructor(e,t,i,r,s){super(e,t,i,r,s),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??I)===F)return;const i=this._$AH,r=e===I&&i!==I||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==I&&(i===I||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ne=$.litHtmlPolyfillSupport;ne?.(J,Q),($.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let ae=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let s=r._$litPart$;if(void 0===s){const e=i?.renderBefore??null;r._$litPart$=s=new Q(t.insertBefore(T(),e),e,void 0,i??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:w},he=(e=de,t,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const s=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,s,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];t.call(this,i),this.requestUpdate(r,s,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e=1,ge=e=>(...t)=>({_$litDirective$:e,values:t});let fe=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const me=ge(class extends fe{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return F}}),be={},ye=ge(class extends fe{constructor(){super(...arguments),this.key=I}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(((e,t=be)=>{e._$AH=t})(e),this.key=t),i}}),we="important",ve=" !"+we,xe=ge(class extends fe{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(ve);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?we:""):i[e]=r}}return F}}),$e="1.3.0-beta-2",ke={U1:"#E3000F",U2:"#A862A4",U3:"#EF7C00",U4:"#00963F",U5:"#008F95",U6:"#9D6830"};var Ae={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"min",now:"jetzt",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",dir_h:"H",dir_r:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{section_sensors:"Haltestellen",sensors_hint:"Eine oder mehrere Haltestellen auswählen",section_filters:"Filter pro Haltestelle",filters_hint:"Linien und/oder Richtung pro Haltestelle einschränken",lines_label:"Linien",direction_label:"Richtung",per_line_direction_label:"Richtung pro Linie",per_line_direction_hint:"Optional: Richtung pro Linie einzeln festlegen. Beide = haltestellenweite Richtung oben verwenden.",per_line_direction_aria:"Richtung für Linie {line}",direction_unavailable:"Keine Abfahrten in dieser Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Countdown zur nächsten Abfahrt anzeigen",show_departures:"Abfahrtsliste anzeigen",hide_attribution:"Datenquelle ausblenden",layout_label:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_sensors_available:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Se={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"H",dir_r:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",barrier_free_title:"Barrierefrei zugänglich",editor:{section_sensor:"Haltestelle",section_direction:"Richtung",section_line:"Linie",section_display:"Darstellung",sensor_hint:"Eine Haltestelle auswählen.",direction_hint:"Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",direction_no_data:"Keine Abfahrten in dieser Richtung",line_hint:"Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_label:"Hintergrund",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",station_hint:"„Standard“ zeigt U-Bahn-Stationen in der Linienfarbe und alle anderen auf weiß. Oder wähle fix Weiß oder Schwarz.",size_label:"Größe",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_label:"Stil",style_classic:"Klassisch",style_warm:"Warm",style_pixel:"Punktmatrix",flicker_label:"Linien-Flimmern",wheelchair_race_label:"Rollstuhl-Rennen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",no_sensors:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines:"Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor."}},ze={modern:Ae,retro:Se},Ee={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"now",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",dir_h:"H",dir_r:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{section_sensors:"Stops",sensors_hint:"Pick one or more stops to display",section_filters:"Per-stop filters",filters_hint:"Optionally restrict lines or direction per stop",lines_label:"Lines",direction_label:"Direction",per_line_direction_label:"Per-line direction",per_line_direction_hint:"Optional: pick the direction for each line individually. Both = use the stop-wide direction above.",per_line_direction_aria:"Direction for line {line}",direction_unavailable:"No departures in this direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",accessibility_only:"Only show step-free departures",show_type_icon:"Show vehicle-type icon",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show next-departure countdown",show_departures:"Show departure list",hide_attribution:"Hide data source",layout_label:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_sensors_available:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines_available:"Lines appear here once stops are selected."}},Ce={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"H",dir_r:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",departures_list:"Upcoming departures",at_platform:"At platform",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",barrier_free_title:"Step-free access",editor:{section_sensor:"Stop",section_direction:"Direction",section_line:"Line",section_display:"Display",sensor_hint:"Pick a single stop.",direction_hint:"Outbound or return — the retro display only shows one direction.",direction_no_data:"No departures in this direction",line_hint:"Optional: restrict to a single line. Tap the active chip again to show all lines.",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_label:"Background",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",station_hint:"“Default” uses the line colour for U-Bahn stops and white for everything else. Or force white or black for all stops.",size_label:"Size",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_label:"Style",style_classic:"Classic",style_warm:"Warm",style_pixel:"Dot matrix",flicker_label:"Line badge flicker",wheelchair_race_label:"Wheelchair race",accessibility_only:"Only show step-free departures",no_sensors:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines:"The sensor currently reports no lines for this stop + direction."}},Re={modern:Ee,retro:Ce};const Le={de:Object.freeze({__proto__:null,default:ze,modern:Ae,retro:Se}),en:Object.freeze({__proto__:null,default:Re,modern:Ee,retro:Ce})};function Te(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Pe(e,t,i){const r=function(e){return"en"===(e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]?"en":"de"}(t);let s=Te(e,Le[r]??Le.de);if(void 0===s&&(s=Te(e,Le.de)),void 0===s)return e;if(i)for(const[e,t]of Object.entries(i))s=s.replace(`{${e}}`,String(t));return s}const De=new Set(["small","medium","regular"]),Me=new Set(["default","white","black"]),Oe=new Set(["classic","warm","pixel"]);function He(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;Number.isFinite(e)&&(e<0||e>120||(t[i]=Math.round(e)))}return Object.keys(t).length?t:void 0}function Ne(e){const t="R"===e.direction?"R":"H",i=De.has(e.size)?e.size:"regular",r=Me.has(e.station_bg)?e.station_bg:"default",s=Oe.has(e.style)?e.style:"classic";return{type:e.type||"custom:wiener-linien-austria-retro-card",entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,show_platform:e.show_platform??!0,show_station_name:e.show_station_name??!1,station_bg:r,size:i,style:s,flicker:!0===e.flicker,wheelchair_race:!0===e.wheelchair_race,accessibility_only:!0===e.accessibility_only,walk_times:He(e.walk_times)}}function Be(e,t,i){return`${e}|${t}|${i}`}function Ue(e,t){const{lines:i,direction:r,line_directions:s,walk_times:n,accessibility_only:o}=t,a=i&&i.length?new Set(i):null;return e.filter(e=>{if(a&&!a.has(e.line))return!1;const t=s?.[e.line]??r;if(t&&e.direction!==t)return!1;if(n){const t=n[Be(e.line,String(e.direction??""),e.towards)];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function We(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};if("number"!=typeof e.diva)continue;if(!Array.isArray(e.departures))continue;(e.attribution??"").toLowerCase().includes("wiener linien")&&t.push(i)}return t.sort(),t}const qe=["small","medium","regular"],je=["default","white","black"],Fe=["classic","warm","pixel"];let Ie=class extends ae{setConfig(e){this._config=Ne(e)}_t(e){return Pe(`retro.${e}`,{hassLanguage:this.hass?.language})}_et(e){return Pe(`retro.editor.${e}`,{hassLanguage:this.hass?.language})}_fire(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_directionsWithData(){const e=this._attrs(this._config?.entity),t=new Set;for(const i of e?.departures??[])"H"!==i.direction&&"R"!==i.direction||t.add(i.direction);return t}_linesForCurrent(){if(!this._config)return[];const e=this._attrs(this._config.entity),t=this._config.direction,i=new Set;for(const r of e?.departures??[])r.direction===t&&r.line&&i.add(r.line);return[...i].sort()}_swallowKeys(e){e.stopPropagation()}_pickEntity(e){this._config&&this._fire({...this._config,entity:e})}_setDirection(e){this._config&&this._config.direction!==e&&this._fire({...this._config,direction:e})}_pickLine(e){if(!this._config)return;const t={...this._config};t.line===e?delete t.line:t.line=e,this._fire(t)}_setShowPlatform(e){this._config&&this._fire({...this._config,show_platform:e})}_setShowStationName(e){this._config&&this._fire({...this._config,show_station_name:e})}_setStationBg(e){this._config&&this._config.station_bg!==e&&this._fire({...this._config,station_bg:e})}_setSize(e){this._config&&this._config.size!==e&&this._fire({...this._config,size:e})}_setStyle(e){this._config&&this._config.style!==e&&this._fire({...this._config,style:e})}_setFlicker(e){this._config&&this._fire({...this._config,flicker:e})}_setWheelchairRace(e){this._config&&this._fire({...this._config,wheelchair_race:e})}_setAccessibilityOnly(e){this._config&&this._fire({...this._config,accessibility_only:e})}_setWalkTime(e,t){if(!this._config)return;const i=parseInt(t,10),r=Number.isFinite(i)&&i>0?Math.min(120,i):null,s={...this._config.walk_times??{}};null===r?delete s[e]:s[e]=r;const n={...this._config};Object.keys(s).length?n.walk_times=s:delete n.walk_times,this._fire(n)}render(){if(!this._config||!this.hass)return I;const e=this._config,t=We(this.hass),i=this._directionsWithData();return j`
      <div class="editor">
        ${this._renderSensorSection(t)}
        ${this._renderDirectionSection(i)}
        ${this._renderLineSection()}
        ${this._renderWalkTimeSection()}
        ${this._renderStationSection(e.show_station_name,e.station_bg)}
        ${this._renderDisplaySection(e.show_platform,e.size,e.style,e.flicker,e.wheelchair_race,e.accessibility_only)}
      </div>
    `}_renderSensorSection(e){const t=this._config.entity,i=e.length?e.map(e=>{const i=function(e,t){const i=e?.states?.[t],r=i?.attributes??{};return r.stop_name||r.friendly_name||t}(this.hass,e),r=e.split(".")[1]??e;return j`
            <button
              type="button"
              class=${me({chip:!0,selected:e===t})}
              @click=${()=>this._pickEntity(e)}
            >
              <span class="stop-name">${i}</span>
              <span class="eid">${r}</span>
            </button>
          `}):j`<div class="editor-hint">${this._et("no_sensors")}</div>`;return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensor")}</div>
        <div class="editor-hint">${this._et("sensor_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderDirectionSection(e){const t=this._config,i=t.entity&&!e.has(t.direction);return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_direction")}</div>
        <div class="editor-hint">${this._et("direction_hint")}</div>
        <div class="direction-buttons">
          <button
            type="button"
            class=${me({active:"H"===t.direction,"no-data":!e.has("H")})}
            @click=${()=>this._setDirection("H")}
          >${this._t("dir_h")}</button>
          <button
            type="button"
            class=${me({active:"R"===t.direction,"no-data":!e.has("R")})}
            @click=${()=>this._setDirection("R")}
          >${this._t("dir_r")}</button>
        </div>
        ${i?j`<div class="direction-warning">${this._et("direction_no_data")}</div>`:I}
      </div>
    `}_renderLineSection(){const e=this._config,t=this._linesForCurrent(),i=t.length?t.map(t=>{const i=t===e.line;return j`
            <button
              type="button"
              class=${me({chip:!0,selected:i})}
              @click=${()=>this._pickLine(t)}
            >
              <span class="stop-name">${t}</span>
            </button>
          `}):j`<div class="editor-hint">${this._et("no_lines")}</div>`;return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_line")}</div>
        <div class="editor-hint">${this._et("line_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderWalkTimeSection(){const e=this._config,t=this._attrs(e.entity),i=e.entity?function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=Be(r.line,String(r.direction??""),r.towards);i.has(e)||(i.add(e),t.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t).filter(t=>t.direction===e.direction):[],r=e.walk_times??{};return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${i.length?i.map(e=>{const t=Be(e.line,e.direction,e.towards),i=r[t];return j`
                  <div class="walk-time-row">
                    <span class="walk-time-badge">${e.line}</span>
                    <span class="walk-time-towards" title=${e.towards}>→ ${e.towards}</span>
                    <input
                      type="number"
                      class="walk-time-input"
                      min="0"
                      max="120"
                      step="1"
                      inputmode="numeric"
                      placeholder=${this._et("walk_time_placeholder")}
                      aria-label=${this._et("walk_time_aria").replace("{line}",e.line).replace("{towards}",e.towards)}
                      .value=${void 0!==i?String(i):""}
                      @keydown=${this._swallowKeys}
                      @keyup=${this._swallowKeys}
                      @keypress=${this._swallowKeys}
                      @change=${e=>this._setWalkTime(t,e.target.value)}
                    />
                  </div>
                `}):j`<div class="editor-hint">${this._et("walk_time_no_data")}</div>`}
        </div>
      </div>
    `}_renderStationSection(e,t){return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_station")}</div>
        <div class="editor-hint">${this._et("station_hint")}</div>
        <div class="toggle-row">
          <label for="retro-show-station">${this._et("show_station_name")}</label>
          <ha-switch
            id="retro-show-station"
            .checked=${e}
            @change=${e=>this._setShowStationName(e.target.checked)}
          ></ha-switch>
        </div>
        ${e?j`
              <div class="segmented-row">
                <span class="segmented-label">${this._et("station_bg_label")}</span>
                <div class="direction-buttons">
                  ${je.map(e=>j`
                      <button
                        type="button"
                        class=${me({active:t===e})}
                        @click=${()=>this._setStationBg(e)}
                      >${this._et(`station_bg_${e}`)}</button>
                    `)}
                </div>
              </div>
            `:I}
      </div>
    `}_renderDisplaySection(e,t,i,r,s,n){return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>
        <div class="toggle-row">
          <label for="retro-show-platform">${this._et("show_platform")}</label>
          <ha-switch
            id="retro-show-platform"
            .checked=${e}
            @change=${e=>this._setShowPlatform(e.target.checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-accessibility-only">${this._et("accessibility_only")}</label>
          <ha-switch
            id="retro-accessibility-only"
            .checked=${n}
            @change=${e=>this._setAccessibilityOnly(e.target.checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-flicker">${this._et("flicker_label")}</label>
          <ha-switch
            id="retro-flicker"
            .checked=${r}
            @change=${e=>this._setFlicker(e.target.checked)}
          ></ha-switch>
        </div>
        <div class="toggle-row">
          <label for="retro-wheelchair-race">${this._et("wheelchair_race_label")}</label>
          <ha-switch
            id="retro-wheelchair-race"
            .checked=${s}
            @change=${e=>this._setWheelchairRace(e.target.checked)}
          ></ha-switch>
        </div>
        <div class="segmented-row">
          <span class="segmented-label">${this._et("size_label")}</span>
          <div class="direction-buttons">
            ${qe.map(e=>j`
                <button
                  type="button"
                  class=${me({active:t===e})}
                  @click=${()=>this._setSize(e)}
                >${this._et(`size_${e}`)}</button>
              `)}
          </div>
        </div>
        <div class="segmented-row">
          <span class="segmented-label">${this._et("style_label")}</span>
          <div class="direction-buttons">
            ${Fe.map(e=>j`
                <button
                  type="button"
                  class=${me({active:i===e})}
                  @click=${()=>this._setStyle(e)}
                >${this._et(`style_${e}`)}</button>
              `)}
          </div>
        </div>
      </div>
    `}static{this.styles=o`
    :host { display: block; }
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .editor-section {
      background: var(--secondary-background-color, rgba(0,0,0,0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .section-header {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .editor-hint {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .entity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 10px 16px;
      border-radius: 22px;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .chip.selected {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .chip:hover { opacity: 0.85; }
    .chip .stop-name { font-weight: 500; }
    .chip .eid {
      font-size: 0.6875rem;
      opacity: 0.7;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 10px 16px;
      border-radius: 22px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-width: 48px;
      min-height: 44px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button.no-data {
      opacity: 0.45;
    }
    .direction-warning {
      margin-top: 4px;
      font-size: 0.75rem;
      color: var(--warning-color, #ffa000);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-row label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      cursor: pointer;
    }
    .segmented-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 4px;
      flex-wrap: wrap;
    }
    .segmented-label {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
    }
    .walk-time-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .walk-time-row {
      display: grid;
      grid-template-columns: 44px 1fr 72px;
      align-items: center;
      gap: 8px;
    }
    .walk-time-badge {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
      background: var(--primary-color);
    }
    .walk-time-towards {
      font-size: 0.8125rem;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .walk-time-input {
      width: 100%;
      box-sizing: border-box;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      text-align: right;
    }
  `}};e([pe({attribute:!1})],Ie.prototype,"hass",void 0),e([ue()],Ie.prototype,"_config",void 0),Ie=e([ce("wiener-linien-austria-retro-card-editor")],Ie),console.info(`%c WIENER-LINIEN-AUSTRIA-RETRO-CARD %c ${$e} `,"color: #FFC700; background: #000; font-weight: 700;","color: #000; background: #FFC700; font-weight: 700;");const Ke=800,Ve=[["A","A","B"],["B","B","A"],["A","B","B"],["B","A","A"],["A","B","A"],["B","A","B"]],Ge=[100,250],Ze=[200,500],Je=[500,900],Ye=[.25,.5,.75],Xe=[3,2.5,2.5];function Qe(e,t){return e?j`<span lang="de">${e}</span>`:t??""}window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-retro-card",name:"Wiener Linien Austria — Retro",description:"LED-Anzeige im Stil der Wiener-Linien-Stationen",preview:!0});let et=class extends ae{constructor(){super(...arguments),this._versionMismatch=null,this._raceState="idle",this._countdownDigit=null,this._raceWinner=null,this._versionCheckDone=!1,this._raceTimers=[],this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._handleCardClick=()=>{this._config?.wheelchair_race&&"idle"===this._raceState&&("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._clearRaceTimers(),this._startRace()))}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-retro-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-retro-card: 'entity' must be a string");this._config=Ne(e)}getCardSize(){return 2}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:2}}static getConfigElement(){return document.createElement("wiener-linien-austria-retro-card-editor")}static getStubConfig(e){const t=We(e)[0]||"";let i="H";const r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){const e=r.some(e=>"H"===e.direction),t=r.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i,size:"small"}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),"idle"!==this._raceState&&this._armStateTransitions()}disconnectedCallback(){super.disconnectedCallback(),this._clearRaceTimers()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_raceState")||e.has("_countdownDigit")||e.has("_raceWinner"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}updated(e){if(super.updated(e),!e.has("_config"))return;const t=e.get("_config"),i=!0===t?.wheelchair_race,r=!0===this._config?.wheelchair_race;r&&!i?(this._clearRaceTimers(),this._startRace()):!r&&i&&(this._clearRaceTimers(),this._raceState="idle",this._countdownStartAt=null,this._countdownDigit=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null)}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return Pe(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{const e=await this.hass.callWS({type:"wiener_linien_austria/retro_card_version"});e?.version&&e.version!==$e&&(this._versionMismatch=e.version)}catch{}}_resolveEntity(){if(this._config?.entity&&this.hass?.states?.[this._config.entity])return this._config.entity;return We(this.hass)[0]??null}_clearRaceTimers(){for(const e of this._raceTimers)clearTimeout(e);this._raceTimers=[]}_scheduleRace(e){const t=setTimeout(()=>this._startRace(),e);this._raceTimers.push(t)}_startRace(){if(!this._config?.wheelchair_race)return;if("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return void this._scheduleRace(this._nextRaceDelay());if(this._currentBarrierFreeCount()<2)return void this._scheduleRace(this._nextRaceDelay());const{winnerCrossT:e}=this._randomizeRaceParams(),t=Date.now();this._raceState="countdown",this._countdownStartAt=t,this._countdownDigit=3,this._raceEndAt=t+2400+e+150,this._freezeEndAt=this._raceEndAt+1500,this._victoryEndAt=this._freezeEndAt+4e3,this._scheduleCountdownTick()}_scheduleCountdownTick(){if("countdown"!==this._raceState||null===this._countdownStartAt)return;const e=Date.now(),t=e-this._countdownStartAt;if(t>=2400)return void this._beginRacing();const i=Math.max(1,Math.min(3,3-Math.floor(t/Ke)));this._countdownDigit!==i&&(this._countdownDigit=i);const r=this._countdownStartAt+(Math.floor(t/Ke)+1)*Ke,s=Math.max(50,r-e);this._raceTimers.push(setTimeout(()=>this._scheduleCountdownTick(),s))}_beginRacing(){this._raceState="racing",this._countdownDigit=null,this._countdownStartAt=null,this._armStateTransitions()}_measureRaceStartPositions(){const e=this.shadowRoot?.querySelector(".retro");if(!e)return null;const t=e.getBoundingClientRect();if(t.width<=0)return null;const i=this.shadowRoot?.querySelectorAll(".retro-row .retro-wheelchair");if(!i||i.length<2)return null;const r=i[0].getBoundingClientRect(),s=i[1].getBoundingClientRect(),n=r.left-t.left,o=s.left-t.left,a=100-("small"===this._config?.size?10:14)/t.width*100-r.width/t.width*100;return{a:n/t.width*100,b:o/t.width*100,finishCqw:a}}_randomizeRaceParams(){const e=(e,t)=>e+Math.random()*(t-e),t=Math.random()<.5?"A":"B",i=Math.random()<.3?"A"===t?"B":"A":t,r=Ve.filter(e=>e[2]===i),s=r[Math.floor(Math.random()*r.length)],n=Math.random(),o=n<.4?e(Ge[0],Ge[1]):n<.75?e(Ze[0],Ze[1]):e(Je[0],Je[1]),a=e(2400,2700),l=a+o,c=a*e(1.08,1.15),d=l*e(1.08,1.15),h="A"===t?c:d,p="B"===t?c:d,u="A"===t?a:l,_="B"===t?a:l,g=this._measureRaceStartPositions(),f=g?.a??0,m=g?.b??0,b=g?.finishCqw??96,y=Math.max(f,m),w=Math.max(20,92-y),v=(e,t)=>{const i=y+Ye[t]*w,r=s[t]===e,n=Xe[t];return o=.6,i+(r?n:-n)+(2*Math.random()-1)*o;var o},x=v("A",0),$=v("A",1),k=v("A",2),A=v("B",0),S=v("B",1),z=v("B",2),E=(e,t,i)=>{const r=b-i,s=e-.75*t;if(r<=0||s<=1)return Math.max(i+5,102);const n=i+.25*r*t/s;return Math.max(102,Math.min(135,n))},C=E(u,h,k),R=E(_,p,z),L=(e,t,i,r,s,n)=>{const o=[[0,.25,e,t],[.25,.5,t,i],[.5,.75,i,r],[.75,1,r,s]];for(const[e,t,i,r]of o){if(i>=b)return e*n;if(r>=b){return(e+(b-i)/(r-i)*(t-e))*n}}return Number.POSITIVE_INFINITY},T=L(f,x,$,k,C,h),P=L(m,A,S,z,R,p);return this._raceWinner=T<=P?"A":"B",this.style.setProperty("--race-a-duration",`${h}ms`),this.style.setProperty("--race-b-duration",`${p}ms`),this.style.setProperty("--race-a-end",C-f+"cqw"),this.style.setProperty("--race-b-end",R-m+"cqw"),this.style.setProperty("--race-a-x-25",x-f+"cqw"),this.style.setProperty("--race-a-x-50",$-f+"cqw"),this.style.setProperty("--race-a-x-75",k-f+"cqw"),this.style.setProperty("--race-b-x-25",A-m+"cqw"),this.style.setProperty("--race-b-x-50",S-m+"cqw"),this.style.setProperty("--race-b-x-75",z-m+"cqw"),{winnerCrossT:Math.min(T,P)}}_armStateTransitions(){this._clearRaceTimers();const e=Date.now();if("countdown"===this._raceState&&null!==this._countdownStartAt)this._scheduleCountdownTick();else if("racing"===this._raceState&&null!==this._raceEndAt){const t=Math.max(0,this._raceEndAt-e);this._raceTimers.push(setTimeout(()=>{this._raceState="freeze",this._raceEndAt=null,this._armStateTransitions()},t))}else if("freeze"===this._raceState&&null!==this._freezeEndAt){const t=Math.max(0,this._freezeEndAt-e);this._raceTimers.push(setTimeout(()=>{this._raceState="victory",this._freezeEndAt=null,this._armStateTransitions()},t))}else if("victory"===this._raceState&&null!==this._victoryEndAt){const t=Math.max(0,this._victoryEndAt-e);this._raceTimers.push(setTimeout(()=>{this._raceState="idle",this._victoryEndAt=null,this._config?.wheelchair_race&&this._scheduleRace(this._nextRaceDelay())},t))}}_nextRaceDelay(){return 6e4+12e4*Math.random()}_currentBarrierFreeCount(){if(!this._config)return 0;const e=this._resolveEntity();if(!e||!this.hass)return 0;const t=this.hass.states[e]?.attributes??{};return Ue(Array.isArray(t.departures)?t.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,2).filter(e=>e.barrier_free).length}render(){if(!this._config)return I;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},r=Array.isArray(i.departures)?i.departures:[],s=Ue(r,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}),n=s.slice(0,2),o=n.find(e=>e.platform)?.platform??null,a=e.show_platform?o:null,l="2"===a,c=n[0]?.type??"",d="ptBusCity"===c||"ptBusNight"===c,h=this._t(d?"steig":"gleis"),p=i.stop_name||i.friendly_name||"",u=e.show_station_name&&!!p?this._renderStationName(p,s,r,e.station_bg):I,_=e.wheelchair_race&&"countdown"===this._raceState,g=e.wheelchair_race&&"racing"===this._raceState,f=e.wheelchair_race&&"freeze"===this._raceState,m=e.wheelchair_race&&"victory"===this._raceState,b=e.wheelchair_race&&"idle"===this._raceState,y="A"===this._raceWinner?1:"B"===this._raceWinner?2:null,w={retro:!0,"retro--gleis-left":!!a&&l,"retro--gleis-right":!!a&&!l,"retro--no-gleis":!a,[`retro--size-${e.size}`]:"regular"!==e.size,[`retro--style-${e.style}`]:"classic"!==e.style,"retro--flicker":e.flicker,"retro--race-countdown":_,"retro--race-active":g,"retro--race-freeze":f,"retro--race-victory":m,"retro--clickable":b};return j`
      <ha-card style="background:#000;padding:0;overflow:hidden;">
        <div
          class=${me(w)}
          @click=${this._handleCardClick}>
          ${this._versionMismatch?this._renderBanner():I}
          ${u}
          <div class="retro-led">
            ${this._renderMain(t,n,s,r,a,h,i.server_time)}
            ${_&&null!==this._countdownDigit?j`<div class="retro-countdown" role="status" aria-live="polite">
                  ${ye(this._countdownDigit,j`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`)}
                  <span class="retro-victory-sr">
                    ${this._t("race_starting_in",{n:this._countdownDigit})}
                  </span>
                </div>`:I}
            ${_||g||f?j`<div class="retro-finish-line" aria-hidden="true"></div>`:I}
            ${m?j`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${null!==y?j`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${y}</span>
                      </div>`:I}
                  <span class="retro-victory-sr">
                    ${null!==y?this._t("race_winner_announce",{n:y}):this._t("race_finished")}
                  </span>
                </div>`:I}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,i,r,s,n,o){if(!e)return j`<div class="retro-empty" role="status" aria-live="polite">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,i=r.filter(t=>t.direction===e);let s="no_data";return 0===r.length&&o?s="betriebsschluss":r.length>0&&0===i.length?s="no_data_wrong_direction":t&&i.length>0&&(s="no_data_wrong_line"),j`<div class="retro-empty" role="status" aria-live="polite">${this._t(s)}</div>`}return j`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${t.map(e=>this._renderRow(e))}
      </ul>
      ${s?this._renderGleis(s,n):I}
    `}_renderRow(e){const t=Number.isFinite(e.countdown)?e.countdown:null,i=null!==t&&t<=0,r=e.line||"?",s=e.towards||"",n=[r,s,null===t?this._t("no_data"):i?this._t("at_platform"):this._t("countdown_minutes",{n:String(t)}),e.barrier_free?this._t("barrier_free_title"):""].filter(Boolean).join(" — ");return j`
      <li class="retro-row" aria-label=${n}>
        <div class="retro-line" aria-hidden="true">${r}</div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-text">${Qe(s)}</span>
          ${e.barrier_free?j`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title=${this._t("barrier_free_title")}
              ></ha-icon>`:I}
        </div>
        <div class="retro-cd" aria-hidden="true">
          ${null===t?"--":i?j`<span class="retro-stars"><span>*</span><span>*</span></span>`:String(t)}
        </div>
      </li>
    `}_renderGleis(e,t){return j`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${t}</div>
        <div class="retro-gleis-number">${e}</div>
      </div>
    `}_renderStationName(e,t,i,r){const s=(t.length?t:i).find(e=>"ptMetro"===e.type),n=s?.line;let o,a;return"white"===r?(o="#fff",a="#000"):"black"===r?(o="#000",a="#fff"):n?(o=ke[n.toUpperCase()]??"var(--primary-color)",a="#fff"):(o="#fff",a="#000"),j`
      <div class="retro-station" style=${xe({background:o,color:a})}>
        <div class="retro-station-name">${Qe(e)}</div>
      </div>
    `}_renderBanner(){const e=this._t("version_update",{v:this._versionMismatch??""});return j`
      <div class="retro-banner">
        <span>${e}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
      </div>
    `}async _reload(){try{if(window.caches?.keys){const e=await window.caches.keys();await Promise.all(e.map(e=>window.caches.delete(e)))}}catch{}window.location.reload()}static{this.styles=o`
    :host {
      display: block;
      /* Create a stacking context on the host so the high z-indexes
         inside (screen-door overlay z=30, victory overlay z=20,
         winner badge z=22, etc.) only compete with other elements
         inside this card. Without this, race overlays and the LED
         dot pattern can render above HA's dashboard chrome. */
      isolation: isolate;
    }
    .retro {
      /* Classic defaults — swapped wholesale by .retro--style-warm below. */
      --led-amber: #FFC700;
      --led-bg: #000;
      --led-substrate: #1a0d2a;
      --led-glow-rgb: 255 199 0;
      --led-dot-size: 0.5px;
      --led-dot-edge: 1px;
      --led-dot-pitch: 4px;

      /* LED area inner padding. Lives on the LED element; declared here so
         size/gleis variants can override via the .retro cascade. */
      --retro-pad-y: 14px;
      --retro-pad-r: 22px;
      --retro-pad-l: 22px;

      /* Establish a container so the race exit animation can translate
         wheelchairs by 100cqw (= full card width) regardless of size. */
      container-type: inline-size;
      position: relative;
      display: flex;
      flex-direction: column;
      font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      min-height: 110px;
    }
    .retro-led {
      /* The actual LED display area — own positioning context so the
         race finish-line and victory overlay fill it edge-to-edge with a
         simple inset:0, no negative-margin gymnastics. */
      flex: 1;
      position: relative;
      display: flex;
      align-items: stretch;
      background: var(--led-bg);
      background-image: radial-gradient(
        circle,
        var(--led-substrate) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      padding: var(--retro-pad-y) var(--retro-pad-r) var(--retro-pad-y) var(--retro-pad-l);
    }
    /* Pixel style — vintage LED-dot-matrix departure-board look. A
       layer above all panel content is transparent at the substrate-
       dot positions and opaque LED-bg between them, so amber text +
       glow + race choreography (wheelchairs, finish strip, countdown
       digit, victory flag, trophy badge) all show through *only* at
       dot positions — aligned with the substrate dot pattern beneath.
       Everything in the LED area becomes discrete "lit LED dots" for a
       consistently dotty panel material.
       Pixel inherits the warm color palette (3px dot pitch) because
       the classic style's 4px pitch is too coarse for the screen-door
       and small text becomes illegible. z-index 30 sits above the
       wheelchair (4), finish strip (3), countdown (18), victory (20)
       — and the trophy badge inside victory's isolated stacking
       context (which appears at z=20 from .retro-led's perspective). */
    .retro--style-pixel .retro-led::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(
        circle,
        transparent var(--led-dot-size),
        var(--led-bg) var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      pointer-events: none;
      z-index: 30;
    }
    .retro--clickable {
      cursor: pointer;
    }
    .retro--style-warm,
    .retro--style-pixel {
      --led-amber: #FFB000;
      --led-bg: #050302;
      --led-substrate: #2a1805;
      --led-glow-rgb: 255 176 0;
      --led-dot-size: 0.9px;
      --led-dot-edge: 1.4px;
      --led-dot-pitch: 3px;
    }
    .retro--gleis-left .retro-gleis { order: -1; }
    .retro--gleis-right { --retro-pad-r: 14px; }
    .retro--gleis-left { --retro-pad-l: 14px; }
    .retro-rows {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      font-size: 1.9em;
      line-height: 1;
      /* Was a <div>; now a <ul> for semantic departure list. Reset the
         default user-agent list chrome so layout is unchanged. */
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .retro-row {
      display: grid;
      grid-template-columns: 2.5em 1fr auto;
      align-items: baseline;
      gap: 12px;
      white-space: nowrap;
    }
    .retro-line {
      font-weight: 400;
      text-align: left;
      transition: opacity 0.15s ease-out;
    }
    .retro-dest {
      display: flex;
      align-items: baseline;
      gap: 0.35em;
      overflow: hidden;
      text-transform: uppercase;
      min-width: 0;
      transition: opacity 0.15s ease-out;
    }
    .retro-dest-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      min-width: 0;
    }
    .retro-wheelchair {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      --mdc-icon-size: 1em;
      color: inherit;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      transform: translateY(0.18em);
    }
    .retro-cd {
      font-variant-numeric: tabular-nums;
      text-align: right;
      min-width: 2.5em;
      transition: opacity 0.4s ease-out;
    }
    .retro-stars {
      display: inline-flex;
      gap: 0.08em;
      justify-content: flex-end;
    }
    .retro-stars > span {
      animation: retroStarBlink 1s infinite;
    }
    .retro-stars > span:nth-child(2) {
      animation-delay: 0.5s;
    }
    @keyframes retroStarBlink {
      0%, 49.99% { opacity: 1; }
      50%, 100%  { opacity: 0; }
    }
    /* Irregular, mostly-on flicker — brief dips and rare blackouts on the
       line badge. Keeps full opacity ~95% of the loop so it reads as a
       struggling bulb rather than a blinking sign. */
    @keyframes retroLineFlicker {
      0%, 6.9%   { opacity: 1; }
      7.1%       { opacity: 0.38; }
      7.5%       { opacity: 1; }
      22.9%      { opacity: 1; }
      23.1%      { opacity: 0.08; }
      23.35%     { opacity: 1; }
      23.7%      { opacity: 0.55; }
      24%        { opacity: 1; }
      51.9%      { opacity: 1; }
      52.15%     { opacity: 0.45; }
      52.4%      { opacity: 1; }
      75.9%      { opacity: 1; }
      76.1%      { opacity: 0.15; }
      76.35%     { opacity: 1; }
      77%        { opacity: 0.6; }
      77.3%      { opacity: 1; }
      100%       { opacity: 1; }
    }
    @media (prefers-reduced-motion: no-preference) {
      .retro--flicker .retro-line {
        animation: retroLineFlicker 7.3s infinite;
        will-change: opacity;
      }
      /* Offset the second row so the two badges don't flicker in lockstep. */
      .retro--flicker .retro-row:nth-child(2) .retro-line {
        animation-duration: 8.1s;
        animation-delay: -2.4s;
      }
    }
    /* Wheelchair race — per-race pattern encodes who's ahead at 25/50/
       75%, so each run has at least one overtake. Per-racer waypoints
       (--race-x-25/50/75), end offset, and duration come from CSS
       custom properties that JS sets at race start. Keyframe preserves
       the 0.18em baseline offset so the icon doesn't jump vertically.
       Per-keyframe timing-functions: ease-out for the launch (burst
       out of the gate) and a symmetric cubic-bezier for every middle
       segment. The cubic-bezier (0.4, 0.2, 0.6, 0.8) has endpoint
       slopes of ~0.5× the segment's average velocity, peaking ~1.5×
       in the middle — so when the swap pattern flips lead/trail at a
       checkpoint, the velocity transition reads as a smooth ease
       instead of an abrupt lurch. */
    @keyframes retroWheelExit {
      0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
      25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
      100% { transform: translate(var(--race-end, 110cqw), 0.18em); }
    }
    @media (prefers-reduced-motion: no-preference) {
      /* LED prep: countdown, racing, and the DEBUG freeze (paused mid-
         race for visual verification) all share the same row-clearing
         + overflow-visible setup. */
      .retro--race-countdown .retro-dest,
      .retro--race-active .retro-dest,
      .retro--race-freeze .retro-dest {
        overflow: visible;
      }
      .retro--race-countdown .retro-cd,
      .retro--race-active .retro-cd,
      .retro--race-freeze .retro-cd {
        opacity: 0;
      }
      /* Only fade Gleis/Steig during the prep when it's on the right —
         that's the wheelchairs' path. Left-side Gleis stays lit. */
      .retro--race-countdown.retro--gleis-right .retro-gleis,
      .retro--race-active.retro--gleis-right .retro-gleis,
      .retro--race-freeze.retro--gleis-right .retro-gleis {
        opacity: 0;
      }
      /* Animation declarations apply during both active and freeze so
         the in-flight animation keeps its identity across the state
         flip — animation-play-state: paused below freezes the frame
         instead of restarting from 0%. */
      .retro--race-active .retro-row:nth-child(1) .retro-wheelchair,
      .retro--race-freeze .retro-row:nth-child(1) .retro-wheelchair {
        --race-end: var(--race-a-end, 110cqw);
        --race-x-25: var(--race-a-x-25, 25cqw);
        --race-x-50: var(--race-a-x-50, 50cqw);
        --race-x-75: var(--race-a-x-75, 75cqw);
        animation: retroWheelExit var(--race-a-duration, 3.3s) linear forwards;
      }
      .retro--race-active .retro-row:nth-child(2) .retro-wheelchair,
      .retro--race-freeze .retro-row:nth-child(2) .retro-wheelchair {
        --race-end: var(--race-b-end, 110cqw);
        --race-x-25: var(--race-b-x-25, 25cqw);
        --race-x-50: var(--race-b-x-50, 50cqw);
        --race-x-75: var(--race-b-x-75, 75cqw);
        animation: retroWheelExit var(--race-b-duration, 3.3s) linear forwards;
      }
      /* Photo-finish freeze: pauses both wheelchair animations at
         the moment shortly after the winner crosses the finish line.
         The viewer gets a clear still frame — winner at the strip,
         loser caught a step behind — before the trophy appears. */
      .retro--race-freeze .retro-wheelchair {
        animation-play-state: paused;
      }
      /* Pass wheelchairs in front of the finish-line strip so the
         crossing reads as "through" rather than "behind the barrier". */
      .retro--race-active .retro-wheelchair,
      .retro--race-freeze .retro-wheelchair {
        position: relative;
        z-index: 4;
      }
      /* Victory holds the racers off-screen until the idle reset. */
      .retro--race-victory .retro-wheelchair {
        opacity: 0;
      }
    }
    /* Hide all row text during victory so nothing bleeds through the
       (slightly transparent) checker flag. */
    .retro--race-victory .retro-line,
    .retro--race-victory .retro-dest,
    .retro--race-victory .retro-cd,
    .retro--race-victory .retro-gleis {
      opacity: 0;
    }
    /* Flicker keyframes set their own opacity values, which win over
       the static opacity:0 above while the animation is running.
       Disable the flicker entirely during victory so the line badge
       hides cleanly with the rest of the row text. */
    .retro--race-victory.retro--flicker .retro-line {
      animation: none;
    }
    /* Pixelated finish-line strip on the right edge during the race.
       Same conic-gradient checker technique as the victory flag, but
       as a narrow 14px column so ~2 squares wide read as chunky "8-bit
       goal posts". Clipped by the card's border-radius via overflow. */
    .retro-finish-line {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 14px;
      z-index: 3;
      pointer-events: none;
      background-image: conic-gradient(
        transparent 0deg 90deg,
        var(--led-amber) 90deg 180deg,
        transparent 180deg 270deg,
        var(--led-amber) 270deg 360deg
      );
      background-size: 14px 14px;
      filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.7));
      animation: retroFinishLineAppear 0.3s ease-out both;
    }
    @keyframes retroFinishLineAppear {
      0%   { opacity: 0; transform: scaleX(0.2); transform-origin: right; }
      100% { opacity: 1; transform: scaleX(1); }
    }
    /* Smaller strip on the small variant so it doesn't dominate. */
    .retro--size-small .retro-finish-line {
      width: 10px;
      background-size: 10px 10px;
    }
    /* Victory overlay: 90s-racing-sim checkered flag scrolling horizontally
       with a pulsing trophy centered on top. */
    .retro-victory {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      overflow: hidden;
      border-radius: inherit;
      opacity: 1;
      isolation: isolate;
      /* Size container so the flag can query card height via cqh and
         keep its checker squares actually square regardless of size. */
      container-type: size;
      animation: retroVictoryAppear 0.22s ease-out both;
    }
    /* Screen-reader-only label inside the victory overlay. The overlay
       is purely visual (checkered flag animation) so we ship a hidden
       text announcement in a role="status"/aria-live region — screen
       readers speak it when the race finishes, sighted users see the
       animation. */
    .retro-victory-sr {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .retro-victory-flag {
      position: absolute;
      inset: 0;
      /* Transparent "dark" tiles let the LED substrate dot pattern of the
         card show through; only the amber rectangles are painted, then the
         drop-shadow filter gives each one the same glow as the row text. */
      background-image: conic-gradient(
        transparent 0deg 90deg,
        var(--led-amber) 90deg 180deg,
        transparent 180deg 270deg,
        var(--led-amber) 270deg 360deg
      );
      /* Tile = 50cqh × 50cqh — square, so height divides the card into
         2 tile rows (= 4 rectangle rows) and the individual rectangles
         stay square at every card size. */
      background-size: 50cqh 50cqh;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      animation: retroVictoryFlag 0.4s linear infinite;
    }
    @keyframes retroVictoryAppear {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes retroVictoryFlag {
      0%   { background-position: 0 0; }
      100% { background-position: 100cqh 0; }
    }

    /* Pre-race countdown overlay — "3, 2, 1" punch-in over the LED
       panel before the racers leave the gate. Single big chunky
       monospace numeral in LED-amber, glowing, with a punch-scale
       animation per digit (Lit re-mounts the <span> via keyed() so
       the keyframe re-fires each tick). The overlay dims the LED
       behind it slightly so the digit reads cleanly. */
    .retro-countdown {
      position: absolute;
      inset: 0;
      z-index: 18;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.6);
      border-radius: inherit;
      overflow: hidden;
      isolation: isolate;
      container-type: size;
      animation: retroCountdownAppear 0.18s ease-out both;
    }
    @keyframes retroCountdownAppear {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    .retro-countdown-digit {
      display: block;
      font-family: ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace;
      font-weight: 900;
      font-size: 60cqh;
      line-height: 1;
      color: var(--led-amber);
      letter-spacing: -0.04em;
      text-shadow:
        0 0 10px rgb(var(--led-glow-rgb) / 0.9),
        0 0 24px rgb(var(--led-glow-rgb) / 0.7),
        0 0 40px rgb(var(--led-glow-rgb) / 0.4);
      animation: retroCountdownPunch 0.8s ease-out both;
      will-change: transform, opacity;
    }
    @keyframes retroCountdownPunch {
      0%   { opacity: 0; transform: scale(0.4); }
      18%  { opacity: 1; transform: scale(1.18); }
      30%  {              transform: scale(1); }
      72%  { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0.85); }
    }

    /* Winner badge — circular cut-out centered on the victory checker
       flag. Background = the card's LED substrate (--led-bg, black in
       classic, dark warm-amber in warm mode) so the badge reads as
       "punched through" the checker flag rather than sitting on top of
       it. Amber LED ring + glow gives it the same lit-from-within
       feel as the rest of the LED panel. mdi:trophy is the visual
       anchor; the lane number sits on its plinth. */
    .retro-victory-winner {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 22;
      width: 41cqmin;
      height: 41cqmin;
      min-width: 82px;
      min-height: 82px;
      max-width: 172px;
      max-height: 172px;
      border-radius: 50%;
      background-color: var(--led-bg);
      background-image: radial-gradient(
        circle,
        var(--led-substrate) var(--led-dot-size),
        transparent var(--led-dot-edge)
      );
      background-size: var(--led-dot-pitch) var(--led-dot-pitch);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--led-amber);
      box-shadow:
        0 0 12px rgb(var(--led-glow-rgb) / 0.85),
        0 0 28px rgb(var(--led-glow-rgb) / 0.55),
        inset 0 0 10px rgb(var(--led-glow-rgb) / 0.25);
      transform: translate(-50%, -50%) scale(0.2);
      opacity: 0;
      animation: retroWinnerBadgeAppear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s forwards;
    }
    @keyframes retroWinnerBadgeAppear {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
      100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    .retro-winner-trophy {
      --mdc-icon-size: 57cqmin;
      color: var(--led-amber);
      filter: drop-shadow(0 0 4px rgb(var(--led-glow-rgb) / 0.85))
              drop-shadow(0 0 10px rgb(var(--led-glow-rgb) / 0.45));
    }
    /* Lane number on the trophy cup. Amber so it reads as part of the
       trophy material. Embossed via a subtle highlight on top-left
       (light from above) + soft shadow on bottom-right (depth), plus
       a faint LED glow to tie it to the rest of the panel. No heavy
       drop-shadow extrusion or thick stroke — those read as a
       separate label sitting on top of the trophy, not as letters
       pressed into the metal. */
    .retro-winner-num {
      position: absolute;
      top: 40%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 900;
      font-size: 22cqmin;
      line-height: 1;
      color: var(--led-amber);
      letter-spacing: -0.04em;
      pointer-events: none;
      text-shadow:
        -1px -1px 0 rgba(255, 240, 180, 0.55),
        1px 1px 1px rgba(0, 0, 0, 0.4),
        0 0 6px rgb(var(--led-glow-rgb) / 0.35);
    }
    /* Tighter on the small variant so trophy + number still fit. */
    .retro--size-small .retro-winner-trophy {
      --mdc-icon-size: 51cqmin;
    }
    .retro--size-small .retro-winner-num {
      font-size: 19cqmin;
      /* On small the badge hits its 82px min-width while the trophy
         icon scales down independently — so the cup ends up a touch
         higher in the badge than on regular/medium. Nudge the number
         up the same amount so it lands on the cup body, not below it. */
      top: 33%;
    }
    /* Pixel style: both the trophy icon and the number are screened
       by the LED dot overlay above. Color the number with
       --led-substrate (the same tone the rest of the panel uses for
       its substrate dots) so the letter's dots match the substrate
       dots of the surrounding panel — the number reads as "unlit
       pixels" within the trophy's lit amber, not as a darker hole
       below the panel background. The embossed shadow stack stops
       making sense once everything is dotty, so drop it. */
    .retro--style-pixel .retro-winner-num {
      color: var(--led-substrate);
      text-shadow: none;
      -webkit-text-stroke: 0;
    }
    /* Pixel mode alignment fix: drop the trophy badge's own substrate
       gradient. The badge's gradient origin doesn't coregister with
       the panel-wide screen-door overlay, so its dots fight the
       overlay's dots inside the badge area. Without it, the trophy
       circle is a clean solid LED-bg cutout from the dotted panel —
       a dark frame around the dotted trophy icon and number. */
    .retro--style-pixel .retro-victory-winner {
      background-image: none;
    }
    /* Pixel style: add 1px of breathing room between the countdown
       digits and the gleis indicator. The screen-door overlay can
       make the dotted digits feel jammed against the gleis dots, so
       a single extra pixel of separation reads cleanly. Covers
       gleis-right (default), gleis-left (platform 2), and the small
       size variant where the base margin starts smaller. */
    .retro--style-pixel .retro-gleis {
      margin-left: 13px;
    }
    .retro--style-pixel.retro--gleis-left .retro-gleis {
      margin-right: 13px;
    }
    .retro--style-pixel.retro--size-small .retro-gleis {
      margin-left: 9px;
    }
    .retro--style-pixel.retro--size-small.retro--gleis-left .retro-gleis {
      margin-right: 9px;
    }

    .retro-gleis {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 14px 0 18px;
      margin-left: 12px;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      border-left: 1px solid rgb(var(--led-glow-rgb) / 0.25);
      transition: opacity 0.4s ease-out;
    }
    .retro--gleis-left .retro-gleis {
      padding: 0 18px 0 14px;
      margin-left: 0;
      margin-right: 12px;
      border-left: none;
      border-right: 1px solid rgb(var(--led-glow-rgb) / 0.25);
    }
    .retro-gleis-label {
      font-size: 0.9em;
      letter-spacing: 2px;
      margin-bottom: 2px;
      opacity: 0.9;
    }
    .retro-gleis-number {
      font-size: 3em;
      line-height: 1;
      font-weight: 400;
    }

    /* ---- size variants ---- */
    .retro--size-medium {
      --retro-pad-y: 11px;
      --retro-pad-r: 18px;
      --retro-pad-l: 18px;
      min-height: 92px;
    }
    .retro--size-medium.retro--gleis-right { --retro-pad-r: 10px; }
    .retro--size-medium.retro--gleis-left { --retro-pad-l: 10px; }
    .retro--size-medium .retro-rows { font-size: 1.55em; gap: 6px; }
    .retro--size-medium .retro-gleis { padding: 0 10px 0 14px; min-width: 48px; }
    .retro--size-medium.retro--gleis-left .retro-gleis {
      padding: 0 14px 0 10px;
    }
    .retro--size-medium .retro-gleis-number { font-size: 2.3em; }
    .retro--size-medium .retro-gleis-label {
      font-size: 0.8em;
      letter-spacing: 1.5px;
    }

    .retro--size-small {
      --retro-pad-y: 8px;
      --retro-pad-r: 14px;
      --retro-pad-l: 14px;
      min-height: 72px;
    }
    .retro--size-small.retro--gleis-right { --retro-pad-r: 6px; }
    .retro--size-small.retro--gleis-left { --retro-pad-l: 6px; }
    .retro--size-small .retro-rows { font-size: 1.25em; gap: 4px; }
    .retro--size-small .retro-row {
      grid-template-columns: 2em 1fr auto;
      gap: 8px;
    }
    .retro--size-small .retro-gleis {
      padding: 0 8px 0 10px;
      min-width: 38px;
      margin-left: 8px;
    }
    .retro--size-small.retro--gleis-left .retro-gleis {
      padding: 0 10px 0 8px;
      margin-left: 0;
      margin-right: 8px;
    }
    .retro--size-small .retro-gleis-number { font-size: 1.75em; }
    .retro--size-small .retro-gleis-label {
      font-size: 0.68em;
      letter-spacing: 1px;
      margin-bottom: 0;
    }
    .retro-empty {
      flex: 1;
      text-align: center;
      align-self: center;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      font-size: 1.4em;
      padding: 20px 0;
      letter-spacing: 2px;
    }
    .retro-station {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 11px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   Helvetica, Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.01em;
      line-height: 1.05;
      font-size: 1.95em;
      border-radius: var(--ha-card-border-radius, 12px)
                     var(--ha-card-border-radius, 12px) 0 0;
    }
    .retro-station-name {
      text-shadow: none;
    }
    .retro--size-medium .retro-station {
      padding: 9px 14px;
      font-size: 1.65em;
    }
    .retro--size-small .retro-station {
      padding: 7px 10px;
      font-size: 1.35em;
    }
    .retro-banner {
      background: #ffa000;
      color: #000;
      padding: 6px 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: sans-serif;
      border-radius: 4px;
      letter-spacing: normal;
      font-size: 0.75em;
    }
    .retro-banner button {
      background: #000;
      color: #ffa000;
      border: none;
      border-radius: 3px;
      padding: 3px 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: sans-serif;
    }

    /* Accessibility: visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--led-amber, #ffa000);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Accessibility: honour user motion preference.
       Catch-all: nukes any animation/transition the feature-gated
       @media (prefers-reduced-motion: no-preference) blocks above
       don't already exclude. */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `}};e([pe({attribute:!1})],et.prototype,"hass",void 0),e([ue()],et.prototype,"_config",void 0),e([ue()],et.prototype,"_versionMismatch",void 0),e([ue()],et.prototype,"_raceState",void 0),e([ue()],et.prototype,"_countdownDigit",void 0),e([ue()],et.prototype,"_raceWinner",void 0),et=e([ce("wiener-linien-austria-retro-card")],et);export{et as WienerLinienAustriaRetroCard};
