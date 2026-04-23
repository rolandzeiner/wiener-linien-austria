// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var s,n=arguments.length,o=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(o=(n<3?s(o):n>3?s(t,i,o):s(t,i))||o);return n>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let n=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=s.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new n(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,_=f.trustedTypes,g=_?_.emptyScript:"",v=f.reactiveElementPolyfillSupport,m=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:s}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const n=r?.call(this);s?.call(this,t),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),s=t.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=r;const n=s.fromAttribute(t,e.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(e,t,i,r=!1,s){if(void 0!==e){const n=this.constructor;if(!1===r&&(s=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??b)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),!0!==s||void 0!==n)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,v?.({ReactiveElement:$}),(f.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,S=e=>e,A=x.trustedTypes,k=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+T,z=`<${C}>`,D=document,U=()=>D.createComment(""),M=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,R="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,P=/>/g,H=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,B=/"/g,W=/^(?:script|style|textarea|title)$/i,F=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),q=new WeakMap,V=D.createTreeWalker(D,129);function G(e,t){if(!L(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let s,n=2===t?"<svg>":3===t?"<math>":"",o=O;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===O?"!--"===l[1]?o=N:void 0!==l[1]?o=P:void 0!==l[2]?(W.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=s??O,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?H:'"'===l[3]?B:j):o===B||o===j?o=H:o===N||o===P?o=O:(o=H,s=void 0);const h=o===H&&e[t+1].startsWith("/>")?" ":"";n+=o===O?i+z:c>=0?(r.push(a),i.slice(0,c)+E+i.slice(c)+T+h):i+T+(-2===c?t:h)}return[G(e,n+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class J{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let s=0,n=0;const o=e.length-1,a=this.parts,[l,c]=Z(e,t);if(this.el=J.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=V.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(E)){const t=c[n++],i=r.getAttribute(e).split(T),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?te:"?"===o[1]?ie:"@"===o[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(T)&&(a.push({type:6,index:s}),r.removeAttribute(e));if(W.test(r.tagName)){const e=r.textContent.split(T),t=e.length-1;if(t>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],U()),V.nextNode(),a.push({type:2,index:++s});r.append(e[t],U())}}}else if(8===r.nodeType)if(r.data===C)a.push({type:2,index:s});else{let e=-1;for(;-1!==(e=r.data.indexOf(T,e+1));)a.push({type:7,index:s}),e+=T.length-1}s++}}static createElement(e,t){const i=D.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,r){if(t===I)return t;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const n=M(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(e),s._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(t=Y(e,s._$AS(e,t.values),s,r)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??D).importNode(t,!0);V.currentNode=r;let s=V.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new X(s,s.nextSibling,this,e):1===a.type?t=new a.ctor(s,a.name,a.strings,this,e):6===a.type&&(t=new se(s,this,e)),this._$AV.push(t),a=i[++o]}n!==a?.index&&(s=V.nextNode(),n++)}return V.currentNode=D,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),M(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>L(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(D.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Q(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new J(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const s of e)r===t.length?t.push(i=new X(this.O(U()),this.O(U()),this,this.options)):i=t[r],i._$AI(s),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,s){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,r){const s=this.strings;let n=!1;if(void 0===s)e=Y(this,e,t,0),n=!M(e)||e!==this._$AH&&e!==I,n&&(this._$AH=e);else{const r=e;let o,a;for(e=s[0],o=0;o<s.length-1;o++)a=Y(this,r[i+o],t,o),a===I&&(a=this._$AH[o]),n||=!M(a)||a!==this._$AH[o],a===K?e=K:e!==K&&(e+=(a??"")+s[o+1]),this._$AH[o]=a}n&&!r&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class re extends ee{constructor(e,t,i,r,s){super(e,t,i,r,s),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??K)===I)return;const i=this._$AH,r=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ne=x.litHtmlPolyfillSupport;ne?.(J,X),(x.litHtmlVersions??=[]).push("3.3.2");const oe=globalThis;let ae=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let s=r._$litPart$;if(void 0===s){const e=i?.renderBefore??null;r._$litPart$=s=new X(t.insertBefore(U(),e),e,void 0,i??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};ae._$litElement$=!0,ae.finalized=!0,oe.litElementHydrateSupport?.({LitElement:ae});const le=oe.litElementPolyfillSupport;le?.({LitElement:ae}),(oe.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:b},he=(e=de,t,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),n.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const s=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,s,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];t.call(this,i),this.requestUpdate(r,s,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const fe=1,_e=2,ge=e=>(...t)=>({_$litDirective$:e,values:t});let ve=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},me=class extends ve{constructor(e){if(super(e),this.it=K,e.type!==_e)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===K||null==e)return this._t=void 0,this.it=e;if(e===I)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};me.directiveName="unsafeHTML",me.resultType=1;const we=ge(me),be=ge(class extends ve{constructor(e){if(super(e),e.type!==fe||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),ye="important",$e=" !"+ye,xe=ge(class extends ve{constructor(e){if(super(e),e.type!==fe||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith($e);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ye:""):i[e]=r}}return I}}),Se="1.2.0",Ae={U1:"#E3000F",U2:"#A862A4",U3:"#EF7C00",U4:"#00963F",U5:"#008F95",U6:"#9D6830"};var ke={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"min",now:"jetzt",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",dir_h:"H",dir_r:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{section_sensors:"Haltestellen",sensors_hint:"Eine oder mehrere Haltestellen auswählen",section_filters:"Filter pro Haltestelle",filters_hint:"Linien und/oder Richtung pro Haltestelle einschränken",lines_label:"Linien",direction_label:"Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_placeholder:"–",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",hide_attribution:"Datenquelle ausblenden",layout_label:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_sensors_available:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Ee={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"H",dir_r:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_sensor:"Haltestelle",section_direction:"Richtung",section_line:"Linie",section_display:"Darstellung",sensor_hint:"Eine Haltestelle auswählen.",direction_hint:"Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",direction_no_data:"Keine Abfahrten in dieser Richtung",line_hint:"Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_label:"Hintergrund",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",station_hint:"„Standard“ zeigt U-Bahn-Stationen in der Linienfarbe und alle anderen auf weiß. Oder wähle fix Weiß oder Schwarz.",size_label:"Größe",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_label:"Stil",style_classic:"Klassisch",style_warm:"Warm",flicker_label:"Linien-Flimmern",wheelchair_race_label:"Rollstuhl-Rennen",no_sensors:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines:"Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor."}},Te={modern:ke,retro:Ee},Ce={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"now",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",dir_h:"H",dir_r:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{section_sensors:"Stops",sensors_hint:"Pick one or more stops to display",section_filters:"Per-stop filters",filters_hint:"Optionally restrict lines or direction per stop",lines_label:"Lines",direction_label:"Direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_placeholder:"–",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",hide_attribution:"Hide data source",layout_label:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_sensors_available:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines_available:"Lines appear here once stops are selected."}},ze={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"H",dir_r:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",editor:{section_sensor:"Stop",section_direction:"Direction",section_line:"Line",section_display:"Display",sensor_hint:"Pick a single stop.",direction_hint:"Outbound or return — the retro display only shows one direction.",direction_no_data:"No departures in this direction",line_hint:"Optional: restrict to a single line. Tap the active chip again to show all lines.",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_label:"Background",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",station_hint:"“Default” uses the line colour for U-Bahn stops and white for everything else. Or force white or black for all stops.",size_label:"Size",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_label:"Style",style_classic:"Classic",style_warm:"Warm",flicker_label:"Line badge flicker",wheelchair_race_label:"Wheelchair race",no_sensors:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines:"The sensor currently reports no lines for this stop + direction."}},De={modern:Ce,retro:ze};const Ue={de:Object.freeze({__proto__:null,default:Te,modern:ke,retro:Ee}),en:Object.freeze({__proto__:null,default:De,modern:Ce,retro:ze})};function Me(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Le(e,t,i){const r=function(e){return"en"===(e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]?"en":"de"}(t);let s=Me(e,Ue[r]??Ue.de);if(void 0===s&&(s=Me(e,Ue.de)),void 0===s)return e;if(i)for(const[e,t]of Object.entries(i))s=s.replace(`{${e}}`,String(t));return s}function Re(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:null;if(!e||"object"!=typeof e)return null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const s=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;Number.isFinite(e)&&(e<0||e>120||(t[i]=Math.round(e)))}return Object.keys(t).length?t:void 0}(t.walk_times);return s&&(r.walk_times=s),r}const Oe=6,Ne=!1,Pe=!0,He=!0,je=!0,Be=!1;function We(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=Re(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const s=Number(e.max_departures),n=Number.isFinite(s)?Math.max(1,Math.min(20,Math.round(s))):Oe,o={};if(e.line_colors&&"object"==typeof e.line_colors)for(const[t,i]of Object.entries(e.line_colors))"string"==typeof i&&/^#[0-9A-Fa-f]{3,8}$/.test(i.trim())&&(o[t.toUpperCase()]=i.trim());return{type:e.type||"custom:wiener-linien-austria-card",entities:i,max_departures:n,line_colors:o,show_accessibility:e.show_accessibility??Ne,show_traffic_info:e.show_traffic_info??Pe,show_elevator_info:e.show_elevator_info??He,show_delay:e.show_delay??je,hide_attribution:e.hide_attribution??Be,layout:"tabs"===e.layout?"tabs":"stacked"}}function Fe(e,t,i="var(--primary-color)"){const r=e.toUpperCase();return t[r]??Ae[r]??i}function Ie(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};if("number"!=typeof e.diva)continue;if(!Array.isArray(e.departures))continue;(e.attribution??"").toLowerCase().includes("wiener linien")&&t.push(i)}return t.sort(),t}function Ke(e,t,i){return`${e}|${t}|${i}`}function qe(e){const t=new Set;for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function Ve(e){return function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}(e).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}function Ge(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}let Ze=class extends ae{setConfig(e){this._config=We(e)}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_et(e){return Le(`modern.editor.${e}`,{hassLanguage:this.hass?.language})}_t(e){return Le(`modern.${e}`,{hassLanguage:this.hass?.language})}_fire(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._fire({...this._config,entities:i})}_toggleStop(e){if(!this._config)return;const t=this._config.entities.findIndex(t=>t.entity===e),i=t>=0?this._config.entities.filter((e,i)=>i!==t):[...this._config.entities,{entity:e}];this._fire({...this._config,entities:i})}_toggleLine(e,t){this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size>0?e.lines=[...i]:delete e.lines,e})}_setDirection(e,t){this._updateStop(e,e=>(null===t?delete e.direction:e.direction=t,e))}_setWalkTime(e,t,i){const r=parseInt(i,10),s=Number.isFinite(r)&&r>0?Math.min(120,r):null;this._updateStop(e,e=>{const i={...e.walk_times??{}};return null===s?delete i[t]:i[t]=s,Object.keys(i).length?e.walk_times=i:delete e.walk_times,e})}_setLineColor(e,t){if(!this._config)return;const i={...this._config.line_colors,[e.toUpperCase()]:t};this._fire({...this._config,line_colors:i})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._fire({...this._config,line_colors:t})}_setLayout(e){this._config&&this._config.layout!==e&&this._fire({...this._config,layout:e})}_setMaxDepartures(e){if(!this._config)return;const t=Math.max(1,Math.min(20,Math.round(e)));t!==this._config.max_departures&&this._fire({...this._config,max_departures:t})}_toggleField(e,t){this._config&&this._fire({...this._config,[e]:t})}_swallowKeys(e){e.stopPropagation()}render(){if(!this._config||!this.hass)return K;const e=this._config,t=Ie(this.hass),i=new Set(e.entities.map(e=>e.entity));return F`
      <div class="editor">
        ${this._renderStopsSection(t,i)}
        ${this._renderFiltersSection()}
        ${this._renderDisplaySection()}
        ${this._renderColorsSection()}
      </div>
    `}_renderStopsSection(e,t){const i=e.length?e.map(e=>{const i=function(e,t){const i=e?.states?.[t],r=i?.attributes??{};return r.stop_name||r.friendly_name||t}(this.hass,e),r=e.split(".")[1]??e,s=t.has(e);return F`
            <button
              type="button"
              class=${be({chip:!0,selected:s})}
              @click=${()=>this._toggleStop(e)}
            >
              <span class="stop-name">${i}</span>
              <span class="eid">${r}</span>
            </button>
          `}):F`<div class="editor-hint">${this._et("no_sensors_available")}</div>`;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_sensors")}</div>
        <div class="editor-hint">${this._et("sensors_hint")}</div>
        <div class="entity-chips">${i}</div>
      </div>
    `}_renderFiltersSection(){const e=this._config,t=e.entities.length?e.entities.map(e=>this._renderStopFilter(e)):F`<div class="editor-hint">${this._et("sensors_hint")}</div>`;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_filters")}</div>
        <div class="editor-hint">${this._et("filters_hint")}</div>
        ${t}
      </div>
    `}_renderStopFilter(e){const t=this.hass?.states?.[e.entity]?.attributes;if(!t)return F``;const i=t.stop_name||e.entity,r=this._config.line_colors,s=qe(t),n=new Set(e.lines??[]),o=e.direction??null,a=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=Ke(r.line,String(r.direction??""),r.towards);i.has(e)||(i.add(e),t.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t).filter(e=>!o||e.direction===o);return F`
      <div class="stop-filter">
        <div class="stop-filter-header">${i}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${s.length?s.map(t=>{const i=0===n.size||n.has(t),s=Fe(t,r),o=i?{background:s,borderColor:s,color:"#fff"}:{};return F`<button
                    type="button"
                    class=${be({chip:!0,selected:i})}
                    style=${xe(o)}
                    @click=${()=>this._toggleLine(e.entity,t)}
                  >${t}</button>`}):F`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${be({active:"H"===o})}
              @click=${()=>this._setDirection(e.entity,"H")}
            >${this._t("dir_h")}</button>
            <button
              type="button"
              class=${be({active:"R"===o})}
              @click=${()=>this._setDirection(e.entity,"R")}
            >${this._t("dir_r")}</button>
            <button
              type="button"
              class=${be({active:null===o})}
              @click=${()=>this._setDirection(e.entity,null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${a.length?F`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
                <div class="editor-hint">${this._et("walk_time_hint")}</div>
                <div class="walk-time-list">
                  ${a.map(t=>{const i=Fe(t.line,r),s=Ke(t.line,t.direction,t.towards),n=e.walk_times?.[s],o=t.towards?`→ ${t.towards}`:"";return F`
                      <div class="walk-time-row">
                        <span class="walk-time-badge" style=${xe({background:i})}>${t.line}</span>
                        <span class="walk-time-towards" title=${t.towards}>${o}</span>
                        <input
                          type="number"
                          class="walk-time-input"
                          min="0"
                          max="120"
                          step="1"
                          inputmode="numeric"
                          placeholder=${this._et("walk_time_placeholder")}
                          .value=${void 0!==n?String(n):""}
                          @keydown=${this._swallowKeys}
                          @keyup=${this._swallowKeys}
                          @keypress=${this._swallowKeys}
                          @change=${t=>this._setWalkTime(e.entity,s,t.target.value)}
                        />
                      </div>
                    `})}
                </div>
              </div>
            `:K}
      </div>
    `}_renderDisplaySection(){const e=this._config;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>

        <div class="toggle-row" style="gap:12px;">
          <span style="font-size:13px;">${this._et("layout_label")}</span>
          <div class="direction-buttons">
            <button
              type="button"
              class=${be({active:"stacked"===e.layout})}
              @click=${()=>this._setLayout("stacked")}
            >${this._et("layout_stacked")}</button>
            <button
              type="button"
              class=${be({active:"tabs"===e.layout})}
              @click=${()=>this._setLayout("tabs")}
            >${this._et("layout_tabs")}</button>
          </div>
        </div>

        <div class="slider-row">
          <span class="slider-label">${this._et("max_departures")}</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            .value=${String(e.max_departures)}
            @keydown=${this._swallowKeys}
            @keyup=${this._swallowKeys}
            @keypress=${this._swallowKeys}
            @change=${e=>this._setMaxDepartures(Number(e.target.value))}
          />
          <span class="slider-value">${e.max_departures}</span>
        </div>

        ${this._renderSwitch("show_accessibility",e.show_accessibility)}
        ${this._renderSwitch("show_traffic_info",e.show_traffic_info)}
        ${this._renderSwitch("show_elevator_info",e.show_elevator_info)}
        ${this._renderSwitch("show_delay",e.show_delay)}
        ${this._renderSwitch("hide_attribution",e.hide_attribution)}
      </div>
    `}_renderSwitch(e,t){const i=`wl-${e.replace(/_/g,"-")}-toggle`;return F`
      <div class="toggle-row">
        <label for=${i}>${this._et(e)}</label>
        <ha-switch
          id=${i}
          .checked=${t}
          @change=${t=>this._toggleField(e,t.target.checked)}
        ></ha-switch>
      </div>
    `}_renderColorsSection(){const e=this._config,t=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of qe(t))i.add(e)}return Array.from(i).sort()}(this.hass,e.entities.map(e=>e.entity)),i=e.line_colors;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${t.length?t.map(e=>{const t=Fe(e,i,"#888888"),r=t.startsWith("#")?t:"#888888",s=Boolean(i[e.toUpperCase()]);return F`
                <div class="color-row">
                  <div class="line-preview" style=${xe({background:t})}>${e}</div>
                  <span>${e}</span>
                  <input
                    type="color"
                    .value=${r}
                    @change=${t=>this._setLineColor(e,t.target.value)}
                  />
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!s}
                    @click=${()=>s&&this._resetLineColor(e)}
                  >${this._et("reset_color")}</button>
                </div>
              `}):F`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
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
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: var(--secondary-text-color);
    }
    .editor-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .entity-chips, .line-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 13px;
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
      font-size: 11px;
      opacity: 0.7;
    }
    .stop-filter {
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stop-filter-header {
      font-size: 13px;
      font-weight: 500;
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stop-filter-row-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }
    .direction-buttons {
      display: inline-flex;
      gap: 4px;
    }
    .direction-buttons button {
      padding: 4px 12px;
      border-radius: 14px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .color-row {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 10px;
    }
    .color-row .line-preview {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
    }
    .color-row input[type="color"] {
      width: 40px;
      height: 28px;
      padding: 0;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
    }
    .color-row .reset-btn {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .color-row .reset-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slider-row input[type="range"] {
      flex: 1;
      accent-color: var(--primary-color);
    }
    .slider-row .slider-label {
      font-size: 13px;
      color: var(--primary-text-color);
      min-width: 180px;
    }
    .slider-value {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-color);
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .toggle-row label {
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
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
    }
    .walk-time-towards {
      font-size: 13px;
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
      font-size: 13px;
      text-align: right;
    }
    .walk-time-input::-webkit-outer-spin-button,
    .walk-time-input::-webkit-inner-spin-button {
      margin: 0;
    }
  `}};e([pe({attribute:!1})],Ze.prototype,"hass",void 0),e([ue()],Ze.prototype,"_config",void 0),Ze=e([ce("wiener-linien-austria-card-editor")],Ze),console.info(`%c WIENER-LINIEN-AUSTRIA-CARD %c ${Se} `,"color: white; background: #E3000F; font-weight: 700;","color: #E3000F; background: white; font-weight: 700;"),window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0});let Je=class extends ae{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._debugTraffic=[],this._debugElevator=[],this._versionCheckDone=!1,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",s=i?.towards||"Unbekannt",n=new Date;this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: Testmeldung`,description:`Debug-Eintrag für Linie ${r} Richtung ${s}.`,description_html:`Debug-Eintrag für Linie ${r} Richtung ${s}.<br><br>Grund: Dev-Mode-Test.`,location:"Debug-Stelle",related_lines:[r],time_start:new Date(n.getTime()-18e5).toISOString(),time_end:new Date(n.getTime()+108e5).toISOString(),time_created:new Date(n.getTime()-18e5).toISOString(),time_last_update:n.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,s=i.departures??[],n=this._randomFrom(s)?.line||"",o=this._randomFrom(s)?.towards||"Unbekannt",a=new Date;this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:`${n||"Station"} Bahnsteig Richtung ${o} — Ausgang ${r}`,reason:"AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",status:"außer Betrieb",related_lines:n?[n]:[],time_start:new Date(a.getTime()-27e5).toISOString(),time_end:new Date(a.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[]}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");this._config=We(e)}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=Ie(e);return{type:"custom:wiener-linien-austria-card",entities:t.length?[t[0]]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return Le(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{const e=await this.hass.callWS({type:"wiener_linien_austria/card_version"});e?.version&&e.version!==Se&&(this._versionMismatch=e.version)}catch{}}_resolveStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=Ie(this.hass);return t.length?[{entity:t[0]}]:[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return K;if(!this.hass)return F`<ha-card><div class="wl-card"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2;i&&this._activeTab>=t.length&&(this._activeTab=0);const r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return F`
      <ha-card>
        <div class="wl-card">
          ${this._versionMismatch?this._renderBanner():K}
          ${e.show_traffic_info?this._renderTrafficBanner(t):K}
          ${this._renderBody(t,i)}
          ${r?F`<div class="wl-attr">${r}</div>`:K}
          ${this._renderDevModePanel()}
        </div>
      </ha-card>
    `}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab];return F`
        ${this._renderTabs(e,this._activeTab)}
        ${this._renderStop(t)}
      `}return F`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=Ie(this.hass).length?"no_entities_picked":"no_entities_available";return F`<div class="wl-empty">${this._t(e)}</div>`}_renderTabs(e,t){return F`
      <div class="wl-tabs">
        ${e.map((e,i)=>{const r=this._attrs(e.entity),s=r.stop_name||r.friendly_name||e.entity;return F`<button
            type="button"
            class=${be({"wl-tab":!0,"wl-tab-active":i===t})}
            @click=${()=>this._setActiveTab(i)}
          >${s}</button>`})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_renderStop(e){const t=this._attrs(e.entity),i=t.stop_name||t.friendly_name||e.entity,r=function(e,t){const{lines:i,direction:r,walk_times:s}=t,n=i&&i.length?new Set(i):null;return e.filter(e=>{if(n&&!n.has(e.line))return!1;if(r&&e.direction!==r)return!1;if(s){const t=s[Ke(e.line,String(e.direction??""),e.towards)];if("number"==typeof t&&e.countdown<t)return!1}return!0})}(Array.isArray(t.departures)?t.departures:[],e),s=r.slice(0,this._config.max_departures),n=Array.isArray(t.elevator_info)?t.elevator_info:[],o=this._debugElevator.filter(t=>t.__debug_entity===e.entity),a=[...n,...o],l=this._config.show_elevator_info&&a.length>0,c=this._stopMapUrl(i,t.latitude,t.longitude),d=this._t("open_in_maps");return F`
      <div class="wl-stop">
        <div class="wl-header">
          ${c?F`<a
                class="wl-stop-link"
                href=${c}
                target="_blank"
                rel="noopener noreferrer"
                title=${d}
                aria-label="${i} — ${d}"
              ><span>${i}</span><ha-icon icon="mdi:open-in-new"></ha-icon></a>`:F`<span>${i}</span>`}
          ${l?this._renderElevatorBadge(a):K}
        </div>
        ${l?this._renderElevatorDetails(a):K}
        ${s.length?s.map(e=>this._renderRow(e)):F`<div class="wl-empty">
              ${this._t(t.server_time?"betriebsschluss":"no_data")}
            </div>`}
      </div>
    `}_renderElevatorBadge(e){const t=this._t("elevator_label"),i=e.map(e=>[e.station,e.description,e.reason].filter(e=>!!e).join(" — ")).join("\n");return F`
      <span class="wl-elevator-badge" title="${t}:\n${i}">
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <span class="wl-elevator-badge-text">${t}</span>
      </span>
    `}_renderElevatorDetails(e){return F`
      <div class="wl-elevator-details">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=e.reason||"",r=Ge(e.time_end,this._lang()),s=Boolean(i||r),n=this._expandedElevator.has(e.name);return F`
      <div
        class=${be({"wl-elevator-detail":!0,"wl-elevator-expanded":n,"wl-elevator-nodetail":!s})}
        @click=${()=>s&&this._toggleElevator(e.name)}
      >
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <div class="wl-elevator-detail-body">
          <div class="wl-elevator-summary">
            <div class="wl-elevator-detail-location">${t}</div>
          </div>
          ${s?F`<div class="wl-elevator-detail-expand">
                ${i?F`<div class="wl-elevator-detail-reason">${i}</div>`:K}
                ${r?F`<div class="wl-elevator-detail-time">
                      ${this._t("elevator_until")} ${r}
                    </div>`:K}
              </div>`:K}
        </div>
        ${s?F`<ha-icon class="wl-elevator-detail-chevron" icon="mdi:chevron-down"></ha-icon>`:K}
      </div>
    `}_toggleElevator(e){const t=new Set(this._expandedElevator);t.has(e)?t.delete(e):t.add(e),this._expandedElevator=t}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));return i.length?F`
      <div class="wl-traffic-list">
        ${i.map(e=>this._renderTrafficItem(e))}
      </div>
    `:K}_renderTrafficItem(e){const t=this._config.line_colors,i=Array.isArray(e.related_lines)?e.related_lines:[],r=e.description_html?Ve(e.description_html):e.description?Ve(e.description):"",s=Ge(e.time_end,this._lang()),n=Ge(e.time_last_update,this._lang()),o=Ge(e.time_created,this._lang()),a=n&&n!==o?n:"",l=Boolean(e.location||s||a),c=Boolean(r||l),d=this._expandedTraffic.has(e.name);return F`
      <div
        class=${be({"wl-traffic":!0,"wl-traffic-expanded":d,"wl-traffic-nodetail":!c})}
        @click=${()=>c&&this._toggleTraffic(e.name)}
      >
        <ha-icon icon="mdi:alert-octagon"></ha-icon>
        <div class="wl-traffic-body">
          <div class="wl-traffic-summary">
            ${i.length?F`<div class="wl-traffic-lines">
                  ${i.map(e=>F`<span
                      class="wl-traffic-line-badge"
                      style=${xe({background:Fe(e,t)})}
                    >${e}</span>`)}
                </div>`:K}
            <div class="wl-traffic-title">${e.title||this._t("traffic_label")}</div>
          </div>
          ${c?F`<div class="wl-traffic-detail">
                ${r?F`<div class="wl-traffic-desc">${we(r)}</div>`:K}
                ${l?F`<div class="wl-traffic-meta">
                      ${e.location?F`<span class="wl-traffic-location-chip">
                            <ha-icon icon="mdi:map-marker"></ha-icon>${e.location}
                          </span>`:K}
                      ${s?F`<span>${this._t("traffic_until")} ${s}</span>`:K}
                      ${a?F`<span>${this._t("traffic_updated")} ${a}</span>`:K}
                    </div>`:K}
              </div>`:K}
        </div>
        ${c?F`<ha-icon class="wl-traffic-chevron" icon="mdi:chevron-down"></ha-icon>`:K}
      </div>
    `}_toggleTraffic(e){const t=new Set(this._expandedTraffic);t.has(e)?t.delete(e):t.add(e),this._expandedTraffic=t}_renderRow(e){const t=this._config.line_colors,i=e.line||"?",r=Fe(i,t),s=Number.isFinite(e.countdown)?e.countdown:null,n=null===s?"—":s<=0?this._t("now"):`${s} ${this._t("min")}`,o=this._config.show_delay?function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real):null,a=null!==o&&o>=1?1===o?this._t("delay_singular"):this._t("delay_plural",{n:o}):"",l=this._config.show_accessibility,c=Boolean(e.traffic_jam||l&&e.barrier_free);return F`
      <div class="wl-row">
        <div class="wl-line" style=${xe({background:r})}>${i}</div>
        <div class="wl-towards">
          ${e.towards||""}${a?F` <span class="wl-delay">${a}</span>`:K}
        </div>
        ${c?F`<span class="wl-flags">
              ${e.traffic_jam?F`<ha-icon
                    class="disturbance"
                    icon="mdi:alert-circle"
                    title=${this._t("disturbance_title")}
                  ></ha-icon>`:K}
              ${l&&e.barrier_free?F`<ha-icon
                    class="a11y"
                    icon="mdi:wheelchair-accessibility"
                    title=${this._t("barrier_free_title")}
                  ></ha-icon>`:K}
            </span>`:F`<span></span>`}
        <div class="wl-countdown">${n}</div>
      </div>
    `}_stopMapUrl(e,t,i){return"number"==typeof t&&"number"==typeof i?`https://www.google.com/maps/search/?api=1&query=${t},${i}`:e?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e}, Wien`)}`:null}_renderBanner(){const e=this._t("version_update",{v:this._versionMismatch??""});return F`
      <div class="wl-banner">
        <span>${e}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
      </div>
    `}async _reload(){try{if(window.caches?.keys){const e=await window.caches.keys();await Promise.all(e.map(e=>window.caches.delete(e)))}}catch{}window.location.reload()}_isDevMode(){try{const e=window.location.hostname||"";if("rpi25"===e||e.startsWith("rpi25."))return!0;if((window.location.search||"").includes("wl_debug=1"))return!0}catch{}return!1}_renderDevModePanel(){return this._isDevMode()?F`
      <div class="wl-devmode">
        <span class="wl-devmode-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="wl-devmode-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `:K}_randomFrom(e){return e.length?e[Math.floor(Math.random()*e.length)]:null}static{this.styles=o`
    :host { display: block; }
    .wl-card { padding: 12px 16px; }
    .wl-banner {
      background: var(--warning-color, #ffa000);
      color: #fff;
      padding: 8px 12px;
      margin: -12px -16px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .wl-banner button {
      background: #fff;
      color: var(--warning-color, #ffa000);
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-weight: 600;
      cursor: pointer;
    }
    /* Tab bar — full-width evenly-distributed tabs, matching the
       tankstellen-austria card. Each tab takes an equal share of the
       row (flex: 1), with ellipsis on overflow so long stop names
       don't break layout. Ports the tankstellen pattern verbatim
       except for the min-width: 0 + text-overflow pair. */
    .wl-tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.12));
      margin-bottom: 10px;
    }
    .wl-tab {
      flex: 1;
      min-width: 0;
      padding: 12px 8px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      font-family: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wl-tab.wl-tab-active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }
    .wl-tab:hover { color: var(--primary-text-color); }
    .wl-stop { margin-bottom: 14px; }
    .wl-stop:last-of-type { margin-bottom: 0; }
    .wl-header {
      font-size: 1.05em;
      font-weight: 600;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .wl-header ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      cursor: help;
    }
    .wl-stop-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: inherit;
      text-decoration: none;
    }
    .wl-stop-link:hover { text-decoration: underline; }
    .wl-stop-link ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
      cursor: pointer;
      opacity: 0.55;
    }
    .wl-stop-link:hover ha-icon { opacity: 1; }
    .wl-elevator-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding: 2px 8px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 14%, transparent);
      color: var(--warning-color, #ffa000);
      cursor: help;
    }
    .wl-elevator-badge-text {
      font-size: 0.75em;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .wl-elevator-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 10%, transparent);
      border-left: 3px solid var(--warning-color, #ffa000);
    }
    .wl-elevator-detail {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
    }
    .wl-elevator-detail.wl-elevator-nodetail { cursor: default; }
    .wl-elevator-detail ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      flex-shrink: 0;
      margin-top: 1px;
    }
    .wl-elevator-detail-chevron {
      margin-left: auto;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      transition: transform 0.15s ease-out;
      flex-shrink: 0;
    }
    .wl-elevator-detail.wl-elevator-expanded .wl-elevator-detail-chevron {
      transform: rotate(180deg);
    }
    .wl-elevator-detail-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      line-height: 1.4;
      min-width: 0;
      flex: 1;
    }
    .wl-elevator-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 8px;
    }
    .wl-elevator-summary .wl-traffic-lines { margin: 0; }
    .wl-elevator-detail-location {
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .wl-elevator-detail-expand {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
      max-height: 600px;
      transition: max-height 0.2s ease-out, opacity 0.15s ease-out;
    }
    .wl-elevator-detail:not(.wl-elevator-expanded) .wl-elevator-detail-expand {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
    .wl-elevator-detail-reason { color: var(--secondary-text-color); }
    .wl-elevator-detail-time {
      color: var(--secondary-text-color);
      font-variant-numeric: tabular-nums;
      font-size: 0.92em;
    }
    .wl-traffic-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
    }
    .wl-traffic {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 8px 10px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--warning-color, #ffa000) 14%, transparent);
      border-left: 3px solid var(--warning-color, #ffa000);
      font-size: 0.85em;
      cursor: pointer;
      user-select: none;
    }
    .wl-traffic-chevron {
      margin-left: auto;
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
      transition: transform 0.15s ease-out;
      flex-shrink: 0;
    }
    .wl-traffic.wl-traffic-expanded .wl-traffic-chevron {
      transform: rotate(180deg);
    }
    .wl-traffic-detail {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
      max-height: 600px;
      transition: max-height 0.2s ease-out, opacity 0.15s ease-out;
    }
    .wl-traffic:not(.wl-traffic-expanded) .wl-traffic-detail {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
    .wl-traffic.wl-traffic-nodetail { cursor: default; }
    .wl-traffic ha-icon {
      --mdc-icon-size: 18px;
      color: var(--warning-color, #ffa000);
      flex-shrink: 0;
    }
    .wl-traffic-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    .wl-traffic-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 8px;
    }
    .wl-traffic-lines {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .wl-traffic-line-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 0.85em;
      font-weight: 700;
      color: #fff;
      background: var(--primary-color);
    }
    .wl-traffic-title { font-weight: 600; }
    .wl-traffic-desc {
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .wl-traffic-meta {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      font-variant-numeric: tabular-nums;
    }
    .wl-traffic-location-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .wl-traffic-location-chip ha-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }
    .wl-empty {
      padding: 18px 0;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .wl-row {
      display: grid;
      grid-template-columns: 44px 1fr auto auto;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    }
    .wl-row:last-child { border-bottom: none; }
    .wl-line {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.9em;
      background: var(--primary-color);
    }
    .wl-towards {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wl-flags {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--secondary-text-color);
    }
    .wl-flags ha-icon { --mdc-icon-size: 16px; }
    .wl-flags .disturbance { color: var(--warning-color, #ffa000); }
    .wl-countdown {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      min-width: 50px;
      text-align: right;
    }
    .wl-delay {
      color: var(--warning-color, #ffa000);
      font-size: 0.88em;
      font-weight: 500;
      margin-left: 4px;
    }
    .wl-attr {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--divider-color, rgba(0,0,0,0.08));
      font-size: 0.75em;
      color: var(--secondary-text-color);
      text-align: center;
    }
    .wl-devmode {
      margin-top: 10px;
      padding: 6px 8px;
      border: 1px dashed var(--secondary-text-color, rgba(0,0,0,0.3));
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75em;
      color: var(--secondary-text-color);
    }
    .wl-devmode-label {
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .wl-devmode button {
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, rgba(0,0,0,0.2));
      background: transparent;
      color: var(--primary-text-color);
      font-size: 0.95em;
      cursor: pointer;
    }
    .wl-devmode button:hover { opacity: 0.8; }
    .wl-devmode .wl-devmode-clear {
      margin-left: auto;
      color: var(--secondary-text-color);
    }
  `}};e([pe({attribute:!1})],Je.prototype,"hass",void 0),e([ue()],Je.prototype,"_config",void 0),e([ue()],Je.prototype,"_activeTab",void 0),e([ue()],Je.prototype,"_versionMismatch",void 0),e([ue()],Je.prototype,"_expandedTraffic",void 0),e([ue()],Je.prototype,"_expandedElevator",void 0),e([ue()],Je.prototype,"_debugTraffic",void 0),e([ue()],Je.prototype,"_debugElevator",void 0),Je=e([ce("wiener-linien-austria-card")],Je);export{Je as WienerLinienAustriaCard};
