// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,o=arguments.length,a=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(o<3?n(a):o>3?n(t,i,a):n(t,i))||a);return o>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new o(i,e,r)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,f=_.trustedTypes,m=f?f.emptyScript:"",g=_.reactiveElementPolyfillSupport,w=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const o=r?.call(this);n?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=r;const o=n.fromAttribute(t,e.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const o=this.constructor;if(!1===r&&(n=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??y)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==n||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[w("elementProperties")]=new Map,x[w("finalized")]=new Map,g?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,$=e=>e,S=k.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+E,T=`<${R}>`,C=document,L=()=>C.createComment(""),H=e=>null===e||"object"!=typeof e&&"function"!=typeof e,M=Array.isArray,D="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,W=/>/g,N=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,j=/"/g,q=/^(?:script|style|textarea|title)$/i,U=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),K=U(1),F=U(2),I=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),G=new WeakMap,Z=C.createTreeWalker(C,129);function Y(e,t){if(!M(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,r=[];let n,o=2===t?"<svg>":3===t?"<math>":"",a=P;for(let t=0;t<i;t++){const i=e[t];let s,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===P?"!--"===l[1]?a=B:void 0!==l[1]?a=W:void 0!==l[2]?(q.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=N):void 0!==l[3]&&(a=N):a===N?">"===l[0]?(a=n??P,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,s=l[1],a=void 0===l[3]?N:'"'===l[3]?j:O):a===j||a===O?a=N:a===B||a===W?a=P:(a=N,n=void 0);const h=a===N&&e[t+1].startsWith("/>")?" ":"";o+=a===P?i+T:c>=0?(r.push(s),i.slice(0,c)+z+i.slice(c)+E+h):i+E+(-2===c?t:h)}return[Y(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class X{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,o=0;const a=e.length-1,s=this.parts,[l,c]=Q(e,t);if(this.el=X.createElement(l,i),Z.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=Z.nextNode())&&s.length<a;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(z)){const t=c[o++],i=r.getAttribute(e).split(E),a=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:a[2],strings:i,ctor:"."===a[1]?re:"?"===a[1]?ne:"@"===a[1]?oe:ie}),r.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:n}),r.removeAttribute(e));if(q.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],L()),Z.nextNode(),s.push({type:2,index:++n});r.append(e[t],L())}}}else if(8===r.nodeType)if(r.data===R)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)s.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=C.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===I)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const o=H(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??C).importNode(t,!0);Z.currentNode=r;let n=Z.nextNode(),o=0,a=0,s=i[0];for(;void 0!==s;){if(o===s.index){let t;2===s.type?t=new te(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new ae(n,this,e)),this._$AV.push(t),s=i[++a]}o!==s?.index&&(n=Z.nextNode(),o++)}return Z.currentNode=C,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),H(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>M(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=X.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new ee(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new X(e)),t}k(e){M(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new te(this.O(L()),this.O(L()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(e,t=this,i,r){const n=this.strings;let o=!1;if(void 0===n)e=J(this,e,t,0),o=!H(e)||e!==this._$AH&&e!==I,o&&(this._$AH=e);else{const r=e;let a,s;for(e=n[0],a=0;a<n.length-1;a++)s=J(this,r[i+a],t,a),s===I&&(s=this._$AH[a]),o||=!H(s)||s!==this._$AH[a],s===V?e=V:e!==V&&(e+=(s??"")+n[a+1]),this._$AH[a]=s}o&&!r&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class re extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class ne extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class oe extends ie{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??V)===I)return;const i=this._$AH,r=e===V&&i!==V||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==V&&(i===V||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ae{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=k.litHtmlPolyfillSupport;se?.(X,te),(k.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new te(t.insertBefore(L(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},ue=(e=pe,t,i)=>{const{kind:r,metadata:n}=i;let o=globalThis.litPropertyMetadata.get(n);if(void 0===o&&globalThis.litPropertyMetadata.set(n,o=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),o.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function _e(e){return(t,i)=>"object"==typeof i?ue(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return _e({...e,state:!0,attribute:!1})}const me=1,ge=3,we=4,be=e=>(...t)=>({_$litDirective$:e,values:t});let ye=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const ve=be(class extends ye{constructor(e){if(super(e),e.type!==me||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),xe={},ke=(e,t=xe)=>e._$AH=t,$e=be(class extends ye{constructor(){super(...arguments),this.key=V}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(ke(e),this.key=t),i}}),Se="important",Ae=" !"+Se,ze=be(class extends ye{constructor(e){if(super(e),e.type!==me||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(Ae);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?Se:""):i[e]=r}}return I}});function Ee(e,t){return e?K`<span lang="de">${e}</span>`:t??""}var Re={editor:{add_chip:"Chip hinzufügen",add_icon:"Symbol hinzufügen",date_format_placeholder:"d.m.Y",direction_label:"Fahrtrichtung",direction_not_served:"nicht bedient",direction_note_one_way:"Rückfahrt deaktiviert: {line} endet hier.",direction_unavailable:"Keine Abfahrten in dieser Richtung",entities:"Haltestellen",entity:"Haltestelle",header_amenities:"Symbole in diesem Slot",header_bar_aria:"Stationsanzeige — Seite wählen",header_chips_and_icons:"Textchips (max. {chips}) und Extra-Symbole (max. {icons})",header_left:"Linke Seite",header_pick_side_hint:"Seite antippen, dann unten füllen",header_right:"Rechte Seite",header_side_aria:"Seite der Stationsanzeige",header_slot_empty:"leer",line_active_aria:"Linie {line} aktiv",line_inactive_aria:"Linie {line} inaktiv",lines_empty_means_all:"leer = alle Linien",lines_label:"Linien an dieser Haltestelle",lines_selected:"{n} von {total}",no_lines_hint:"Die Linien erscheinen, sobald diese Haltestelle Abfahrten meldet.",no_lines_title:"Noch keine Linien verfügbar",per_line_direction_aria:"Linie {line}: {direction}",remove_chip_aria:"Chip {chip} entfernen",remove_icon_aria:"Symbol {icon} entfernen",remove_stop:"Haltestelle entfernen",section_board:"Fallblatt-Tafel",section_departure_row:"Abfahrtszeile",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Fußzeile",section_header:"Stationsanzeige",section_header_hint:"Direkt am Balken",section_led_panel:"LED-Anzeige",section_station:"Stationsband",section_walk_time:"Gehzeit zur Haltestelle",show_clock_short:"Uhr",show_date_short:"Datum",show_elevator_short:"Lift",show_escalator_short:"Rolltreppe",show_wc_short:"WC",size_medium:"Mittel",size_regular:"Standard",size_small:"Klein",tab_display:"Anzeige",tab_stop:"Haltestelle",tab_stops:"Haltestellen",tab_tweaks:"Stil",text_placeholder:"z. B. Name der nächsten Station",walk_time_aria:"Gehzeit in Minuten für Linie {line} Richtung {towards}",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_hint:"Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.",walk_time_less_aria:"Gehzeit für Linie {line} verringern",walk_time_more_aria:"Gehzeit für Linie {line} erhöhen",walk_time_placeholder:"–",walk_time_unit:"Minuten"}},Te={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",stale_feed_detail:"Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.",stale_feed_since:"Letzte gemeldete Abfahrt: {time}",stale_feed_partial:"Einzelne Linien melden keine aktuellen Zeiten.",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle einen anderen Sensor oder entferne ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",cooling_title:"Klimatisiert",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",qr_dialog_close:"QR-Code schließen",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_colors_btn:"Linienfarben",devmode_clear_btn:"Löschen",editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Barrierefrei-Symbol anzeigen“.",colors_empty_hint:"Wähle im ersten Reiter Haltestellen aus — ihre Linien erscheinen dann hier.",colors_hint:"Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_requires:"Wirkt erst ab zwei Haltestellen.",layout_stacked:"Gestapelt",layout_tabs:"Reiter",max_departures:"Anzahl Abfahrten pro Haltestelle",pick_color_for_line:"Farbe für Linie {line} wählen",reset_color:"Auf Standard zurücksetzen",reset_color_aria:"Linienfarbe {line} auf Standard zurücksetzen",section_colors:"Linienfarben",section_colors_hint:"überschreibt API-Farbe",section_departure_row_hint:"pro Zeile",section_disruptions:"Störungen & Verspätungen",section_layout:"Aufbau",section_layout_hint:"Struktur",show_accessibility:"Barrierefrei-Symbol anzeigen",show_cooling:"Klimaanlagen-Symbol anzeigen",show_cooling_helper:"Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.",show_delay:"Verspätungen anzeigen",show_delay_colors:"Verspätungen farblich hervorheben",show_delay_colors_helper:"Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.",show_delay_colors_requires:"Braucht „Verspätungen anzeigen“.",show_departures:"Abfahrtsliste anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_hero_metric:"Nächste Abfahrt groß anzeigen",show_platform:"Gleis/Steig anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",show_stops_ahead:"Zwischenstationen anzeigen",show_traffic_info:"Störungen anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen"}},Ce={editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",chips:"Zusätzliche Beschriftungen",date_format:"Datumsformat",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",flicker:"LED-Flackern simulieren",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",housing:"LED-Gehäuserahmen anzeigen",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",line_stripe:"Seitlichen Linienstreifen anzeigen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",message_text:"Nachricht",message_text_requires:"Braucht „Lauftext anzeigen“.",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",platform_side:"Gleis/Steig-Seite",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_left:"Immer links",platform_side_requires:"Braucht „Steig anzeigen“.",platform_side_right:"Immer rechts",show_clock:"Uhr-Plakette anzeigen",show_date:"Datums-Plakette anzeigen",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_pill:"Linien-Plakette anzeigen",show_line_pill_helper:"Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.",show_platform:"Steig anzeigen",show_station_name:"Stationsnamen anzeigen",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",size:"Größe",station_bg:"Stationsschild-Hintergrund",station_bg_black:"Schwarz",station_bg_default:"Standard",station_bg_white:"Weiß",style:"Stil",style_classic:"Klassisch",style_pixel:"Punktmatrix",style_warm:"Warm",text:"Beschriftung",wheelchair_race:"Rollstuhl-Rennen (Easter Egg)"},aria_dismiss_message:"Lauftext schließen",aria_start_race:"Barrierefreiheits-Rennen starten",at_platform:"Einfahrt",barrier_free_title:"Barrierefrei zugänglich",betriebsschluss:"Betriebsschluss",countdown_minutes:"{n} Minuten",departures_list:"Kommende Abfahrten",dir_both:"Beide",dir_h:"Hinfahrt",dir_h_short:"H",dir_r:"Rückfahrt",dir_r_short:"R",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.",gleis:"GLEIS",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",no_entity:"Keine Haltestelle ausgewählt",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",stale_feed:"Keine aktuellen Daten",steig:"STEIG",unit_min:"min",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",via_prefix:"ÜBER"},Le={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",col_line:"LINIE",col_dest:"RICHTUNG",col_step_free:"STUFENLOS",col_cd:"ANKUNFT",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließe diesen Browser-Tab und öffne das Dashboard erneut, oder lösche die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wähle oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",not_barrier_free_title:"Nicht barrierefrei",unit_min:"min",dir_both:"Beide",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Rollstuhl-Plakette anzeigen“.",chips:"Zusätzliche Beschriftungen",date_format:"Datumsformat",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.",housing:"Gehäuserahmen anzeigen",housing_helper:"Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",show_clock:"Uhr-Plakette anzeigen",show_date:"Datums-Plakette anzeigen",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_column:"Linienspalte anzeigen",show_line_column_helper:"Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",show_platform:"Gleis/Steig anzeigen",show_platform_helper:"Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.",show_station_name:"Stationsnamen anzeigen",show_station_name_helper:"Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.",size:"Größe",station_bg:"Hintergrund Stationsschild",station_bg_black:"Schwarz",station_bg_helper:"Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.",station_bg_line:"Erste Linie",station_bg_white:"Weiß",text:"Beschriftung"}},He={common:Re,modern:Te,retro:Ce,flap:Le},Me={editor:{add_chip:"Add chip",add_icon:"Add icon",date_format_placeholder:"d.m.Y",direction_label:"Direction",direction_not_served:"not served",direction_note_one_way:"Return direction disabled: {line} terminates here.",direction_unavailable:"No departures in this direction",entities:"Stops",entity:"Stop",header_amenities:"Icons in this slot",header_bar_aria:"Station sign — choose a side",header_chips_and_icons:"Text chips (max. {chips}) and extra icons (max. {icons})",header_left:"Left side",header_pick_side_hint:"Tap a side, then fill it in below",header_right:"Right side",header_side_aria:"Station sign side",header_slot_empty:"empty",line_active_aria:"Line {line} active",line_inactive_aria:"Line {line} inactive",lines_empty_means_all:"empty = all lines",lines_label:"Lines at this stop",lines_selected:"{n} of {total}",no_lines_hint:"Lines appear as soon as this stop reports departures.",no_lines_title:"No lines yet",per_line_direction_aria:"Line {line}: {direction}",remove_chip_aria:"Remove chip {chip}",remove_icon_aria:"Remove icon {icon}",remove_stop:"Remove stop",section_board:"Split-flap board",section_departure_row:"Departure row",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Footer",section_header:"Station sign",section_header_hint:"Edit on the bar",section_led_panel:"LED panel",section_station:"Station band",section_walk_time:"Walking time to the stop",show_clock_short:"Clock",show_date_short:"Date",show_elevator_short:"Elevator",show_escalator_short:"Escalator",show_wc_short:"WC",size_medium:"Medium",size_regular:"Standard",size_small:"Small",tab_display:"Display",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Style",text_placeholder:"e.g. name of the next station",walk_time_aria:"Walking time in minutes for line {line} towards {towards}",walk_time_branching_hint:"Applies to every terminus in this direction",walk_time_hint:"Hides departures that would leave without you. Empty = no filter.",walk_time_less_aria:"Decrease walking time for line {line}",walk_time_more_aria:"Increase walking time for line {line}",walk_time_placeholder:"–",walk_time_unit:"minutes"}},De={no_data:"No departures available",betriebsschluss:"End of service",stale_feed:"No live data",stale_feed_detail:"Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.",stale_feed_since:"Last reported departure: {time}",stale_feed_partial:"Some lines aren't reporting current times.",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",cooling_title:"Air conditioned",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",qr_dialog_close:"Close QR code",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_colors_btn:"Line colours",devmode_clear_btn:"Clear",editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show accessibility icon”.",colors_empty_hint:"Pick stops on the Stops tab — their lines will show up here.",colors_hint:"Optional. Without an override the official line colour applies.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",layout:"Multi-stop layout",layout_requires:"Only takes effect with two or more stops.",layout_stacked:"Stacked",layout_tabs:"Tabs",max_departures:"Departures per stop",pick_color_for_line:"Pick colour for line {line}",reset_color:"Reset to default",reset_color_aria:"Reset line colour {line} to default",section_colors:"Line colours",section_colors_hint:"overrides the API colour",section_departure_row_hint:"per row",section_disruptions:"Disruptions & delays",section_layout:"Structure",section_layout_hint:"Layout",show_accessibility:"Show step-free icon",show_cooling:"Show air-conditioning icon",show_cooling_helper:"Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.",show_delay:"Show delays",show_delay_colors:"Colour-code delays",show_delay_colors_helper:"Turns the countdown number red when a departure runs late and green when it runs early.",show_delay_colors_requires:"Requires “Show delays”.",show_departures:"Show departure list",show_elevator_info:"Show elevator outages",show_hero_metric:"Show next departure large",show_platform:"Show platform / track",show_qr_button:"Show QR-code button",show_stops_ahead:"Show intermediate stops",show_traffic_info:"Show disruption alerts",show_type_icon:"Show vehicle-type icon"}},Pe={editor:{accessibility_only:"Only show step-free departures",chips:"Extra labels",date_format:"Date format",exit:"Exit icon",extra_icons:"Extra icons",flicker:"Simulate LED flicker",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",housing:"Show LED cabinet frame",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",line_stripe:"Show line stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",message_text:"Message",message_text_requires:"Requires “Show ticker”.",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",platform_side:"Platform side",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_left:"Always left",platform_side_requires:"Requires “Show platform”.",platform_side_right:"Always right",show_clock:"Show clock chip",show_date:"Show date chip",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_pill:"Show line badge",show_line_pill_helper:"Renders the line code as a filled badge in the line colour rather than plain text.",show_platform:"Show platform",show_station_name:"Show station name",show_unit:"Show the “min” unit",show_unit_helper:'Trail each countdown number with a small amber "min" caption.',size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_default:"Default",station_bg_white:"White",style:"Style",style_classic:"Classic",style_pixel:"Dot matrix",style_warm:"Warm",text:"Sign text",wheelchair_race:"Wheelchair race (easter egg)"},aria_dismiss_message:"Dismiss scrolling message",aria_start_race:"Start accessibility race",at_platform:"Arriving",barrier_free_title:"Step-free access",betriebsschluss:"End of service",countdown_minutes:"{n} minutes",departures_list:"Upcoming departures",dir_both:"Both",dir_h:"Outbound",dir_h_short:"H",dir_r:"Return",dir_r_short:"R",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",gleis:"PLATF.",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",no_entity:"No stop selected",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",stale_feed:"No live data",steig:"BAY",unit_min:"min",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",version_update:"Retro card updated to v{v} — please reload",via_prefix:"VIA"},Be={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",stale_feed:"No live data",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"BAY",col_line:"LINE",col_dest:"DIRECTION",col_step_free:"STEP-FREE",col_cd:"ARRIVAL",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",not_barrier_free_title:"Step-free access not available",unit_min:"min",dir_both:"Both",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show wheelchair badge”.",chips:"Extra labels",date_format:"Date format",exit:"Exit icon",extra_icons:"Extra icons",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.",housing:"Show cabinet frame",housing_helper:"Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",show_clock:"Show clock chip",show_date:"Show date chip",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_column:"Show line column",show_line_column_helper:"Shows the column carrying the line code. Turn it off when the board only ever shows one line.",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",show_platform:"Show platform / track",show_platform_helper:"Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.",show_station_name:"Show station name",show_station_name_helper:"Coloured band with the station name and current time at the top of the card.",size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_helper:"Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.",station_bg_line:"First line",station_bg_white:"White",text:"Sign text"}},We={common:Me,modern:De,retro:Pe,flap:Be};const Ne={de:Object.freeze({__proto__:null,common:Re,default:He,flap:Le,modern:Te,retro:Ce}),en:Object.freeze({__proto__:null,common:Me,default:We,flap:Be,modern:De,retro:Pe})},Oe=Ne.de??{};function je(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function qe(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let n=je(e,Ne[r]??Oe);if(void 0===n&&(n=je(e,Oe)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Ue(e,t,i="banner"){if(!e)return V;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return K`
      <div class=${i} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}const r=t("version_update").replace("{v}",e),n=t("version_reload");return K`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${n}
        @click=${()=>function(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,"1")}catch{}window.location.reload()}(e)}
      >
        ${n}
      </button>
    </div>
  `}const Ke=e=>Math.min(1,Math.max(0,e)),Fe=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4;const Ie=([e,t,i])=>"#"+[e,t,i].map(e=>Math.round(255*Ke((e=>e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)(e))).toString(16).padStart(2,"0")).join("");function Ve(e,t){if(void 0===t)return null;const i=function(e){const t=e.trim();if(!t||t.includes("var("))return null;let i=/^#[0-9a-f]{3,8}$/i.test(t)?t.slice(1):"";if(!i){let e="";try{const i=document.createElement("span").style;i.color=t,e=i.color.trim()}catch{return null}const i=/^rgba?\(([^)]+)\)$/.exec(e);if(!i?.[1])return null;const r=i[1].split(/[,\s/]+/).filter(Boolean).map(Number),[n,o,a]=r;return void 0===n||void 0===o||void 0===a?null:[n,o,a].every(Number.isFinite)?[Fe(n/255),Fe(o/255),Fe(a/255)]:null}if(3!==i.length&&4!==i.length||(i=[...i.slice(0,3)].map(e=>e+e).join("")),6!==i.length&&8!==i.length)return null;const r=Number.parseInt(i.slice(0,6),16);return Number.isFinite(r)?[Fe((r>>16&255)/255),Fe((r>>8&255)/255),Fe((255&r)/255)]:null}(e);if(!i)return null;const[r,n,o]=function([e,t,i]){const r=Math.cbrt(.4122214708*e+.5363325363*t+.0514459929*i),n=Math.cbrt(.2119034982*e+.6806995451*t+.1073969566*i),o=Math.cbrt(.0883024619*e+.2817188376*t+.6299787005*i);return[.2104542553*r+.793617785*n-.0040720468*o,1.9779984951*r-2.428592205*n+.4505937099*o,.0259040371*r+.7827717662*n-.808675766*o]}(i),a="dark"===t?Math.max(.72,r):Math.min(.45,r);if(a===r)return Ie(i);const s=Math.hypot(n,o),l=Math.atan2(o,n),c=function([e,t,i]){const r=(e+.3963377774*t+.2158037573*i)**3,n=(e-.1055613458*t-.0638541728*i)**3,o=(e-.0894841775*t-1.291485548*i)**3;return[4.0767416621*r-3.3077115913*n+.2309699292*o,-1.2684380046*r+2.6097574011*n-.3413193965*o,-.0041960863*r-.7034186147*n+1.707614701*o]}([a,s*Math.cos(l),s*Math.sin(l)]);return Ie([Ke(c[0]),Ke(c[1]),Ke(c[2])])}const Ge={retro:!1},Ze={retro:!1},Ye={retro:"regular"},Qe={retro:!1},Xe={retro:"default"},Je={retro:!0},et=2,tt={exit:{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"left",labelKey:"icon_exit",shapes:()=>F`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `},"exit-access":{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"right",labelKey:"icon_exit_access",shapes:()=>F`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `},wc:{kind:"text",text:"WC",labelKey:"icon_wc"},escalator:{kind:"svg",viewBox:"0 0 36.74 28.3",labelKey:"icon_escalator",shapes:()=>F`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `},elevator:{kind:"svg",viewBox:"0 0 24.01 36.69",labelKey:"icon_elevator",shapes:()=>F`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `}},it=["mdi:exit-run","mdi:exit-to-app","mdi:door-open","mdi:stairs"],rt={"mdi:exit-run":{labelKey:"icon_mdi_exit_run",glyphPointsTo:"right"},"mdi:exit-to-app":{labelKey:"icon_mdi_exit_to_app",glyphPointsTo:"right"},"mdi:door-open":{labelKey:"icon_mdi_door_open"},"mdi:stairs":{labelKey:"icon_mdi_stairs"}};function nt(e,t){const i=tt[e];if("text"===i.kind)return K`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${i.text}</span>
    </span>`;const r=t.flipX?"retro-station-header__icon retro-station-header__icon--flip-x":"retro-station-header__icon";return K`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
    <svg
      class=${r}
      viewBox=${i.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${i.shapes()}</svg>
  </span>`}function ot(e,t){return"boolean"==typeof e?e:t}const at=new Set(["small","medium","regular"]),st=new Set(["default","white","black"]),lt=new Set(["classic","warm","pixel"]),ct=new Set(["auto","left","right"]),dt=new Set(["none","regular","accessible",...it]);function ht(e,t,i){if("string"!=typeof e)return;const r=i?e.trim().slice(0,t):e.slice(0,t);return r.length>0?r:void 0}function pt(e,t){if(!Array.isArray(e))return;const{maxCount:i,truncateTo:r,accept:n}=t,o=e.filter(e=>"string"==typeof e).map(e=>void 0===r?e.trim():e.trim().slice(0,r)).filter(e=>e.length>0&&(void 0===n||n(e))).slice(0,i);return o.length>0?o:void 0}const ut=/^[a-z0-9_-]+:[a-z0-9_-]+$/i;function _t(e){if(!e||"object"!=typeof e)return;const t=e,i={},r=dt.has(t.exit)?t.exit:"none";"none"!==r&&(i.exit=r);const n=ht(t.text,64,!0);void 0!==n&&(i.text=n),!0===t.show_wc&&(i.show_wc=!0),!0===t.show_escalator&&(i.show_escalator=!0),!0===t.show_elevator&&(i.show_elevator=!0),!0===t.show_clock&&(i.show_clock=!0),!0===t.show_date&&(i.show_date=!0);const o=pt(t.chips,{truncateTo:16,maxCount:6});void 0!==o&&(i.chips=o);const a=pt(t.extra_icons,{maxCount:3,accept:e=>ut.test(e)&&e.length<=64});if(void 0!==a&&(i.extra_icons=a),0===Object.keys(i).length)return;const s=ht(t.date_format,32,!1);return void 0!==s&&(i.date_format=s),i}function ft(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${i}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}const n=i.split("|"),o=n.length>=3?`${n[0]}|${n[1]}`:i,a=Math.round(e),s=t[o];t[o]=void 0===s?a:Math.max(s,a)}return Object.keys(t).length?t:void 0}const mt=new Set(["type","entity","direction","line","show_platform","platform_side","show_station_name","station_bg","size","style","flicker","wheelchair_race","accessibility_only","message_ticker","message_text","walk_times","show_header","header_left","header_right","show_line_pill","line_pill","line_stripe","housing","show_unit"]);function gt(e){const t="R"===e.direction?"R":"H",i=at.has(e.size)?e.size:Ye.retro,r=st.has(e.station_bg)?e.station_bg:Xe.retro,n=lt.has(e.style)?e.style:"classic",o=function(e,t){const i={};if(!e||"object"!=typeof e)return i;for(const[r,n]of Object.entries(e))t.has(r)||(i[r]=n);return i}(e,mt);return{...o,type:e.type||"custom:wiener-linien-austria-retro-card",entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,show_platform:ot(e.show_platform,Je.retro),platform_side:ct.has(e.platform_side)?e.platform_side:"auto",show_station_name:ot(e.show_station_name,Ge.retro),station_bg:r,size:i,style:n,flicker:!0===e.flicker,wheelchair_race:!0===e.wheelchair_race,accessibility_only:!0===e.accessibility_only,message_ticker:!0===e.message_ticker,message_text:"string"==typeof e.message_text&&e.message_text.trim()?e.message_text.slice(0,160):void 0,walk_times:ft(e.walk_times),show_header:!0===e.show_header,header_left:_t(e.header_left),header_right:_t(e.header_right),show_line_pill:void 0!==e.show_line_pill?!0===e.show_line_pill:!0===e.line_pill,line_stripe:!0===e.line_stripe,housing:ot(e.housing,Ze.retro),show_unit:ot(e.show_unit,Qe.retro)}}function wt(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:"#1b1464",color:"#fef200"};const o=i[e]??i[n];return o?.bg?o.fg?{background:`#${o.bg}`,color:`#${o.fg}`}:{background:`#${o.bg}`}:{background:r}}function bt(e,t){return`${e}|${t}`}function yt(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}function vt(e,t){if(!e)return[];const i=new Set;if(e.tracked_line_keys?.length){for(const r of e.tracked_line_keys){const[e,n]=r.split("|",2);e&&(t&&n!==t||i.add(e))}if(i.size>0)return[...i].sort()}for(const r of e.departures??[])t&&r.direction!==t||r.line&&i.add(r.line);return[...i].sort()}function xt(e,t){const i=new Set;for(const r of e?.tracked_line_keys??[]){const[e,n]=r.split("|",2);t&&e!==t||("H"!==n&&"R"!==n||i.add(n))}if(0===i.size)for(const r of e?.departures??[])t&&r.line!==t||"H"!==r.direction&&"R"!==r.direction||i.add(r.direction);const r=[...i];return{available:i,unknown:0===i.size,oneWay:1===i.size?r[0]??null:null}}function kt(e,t){if(0===t.size)return[...e];const i=e.filter(e=>t.has(e));for(const e of t)i.includes(e)||i.push(e);return i}function $t(e,t){const{lines:i,direction:r,line_directions:n,walk_times:o,accessibility_only:a}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(o){const t=o[bt(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(a&&!e.barrier_free)})}function St(e,t){const{lines:i,picked:r,lineDirections:n,stopDirection:o}=t,a=e=>n[e]??o,s=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=bt(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(e).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;const t=a(e.line);return!t||e.direction===t}),l=new Set(s.map(e=>e.line)),c=kt(i,r),d=[];for(const e of c){if(l.has(e))continue;const t=a(e);for(const i of t?[t]:["H","R"])d.push({line:e,direction:i,type:"",termini:[]})}return[...s,...d].sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line))}const At="ptMetro";function zt(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}const Et="wl-austria-fonts";function Rt(e){return String(e).padStart(2,"0")}function Tt(e,t,i){if(!e||!t)return null;const r=Date.parse(e);return Number.isFinite(r)?function(e,t,i="de"){if(!t)return"";const r="en"===i?"en-GB":"de-AT",n=()=>e.toLocaleDateString(r,{weekday:"long"}),o=()=>e.toLocaleDateString(r,{weekday:"short"}),a=()=>e.toLocaleDateString(r,{month:"long"}),s=()=>e.toLocaleDateString(r,{month:"short"});let l="",c=0;for(;c<t.length;){const i=t[c];if("\\"===i&&c+1<t.length)l+=t[c+1],c+=2;else{switch(i){case"d":l+=Rt(e.getDate());break;case"j":l+=String(e.getDate());break;case"D":l+=o();break;case"l":l+=n();break;case"m":l+=Rt(e.getMonth()+1);break;case"n":l+=String(e.getMonth()+1);break;case"M":l+=s();break;case"F":l+=a();break;case"Y":l+=String(e.getFullYear());break;case"y":l+=Rt(e.getFullYear()%100);break;case"H":l+=Rt(e.getHours());break;case"G":l+=String(e.getHours());break;case"h":l+=Rt((e.getHours()+11)%12+1);break;case"g":l+=String((e.getHours()+11)%12+1);break;case"i":l+=Rt(e.getMinutes());break;case"s":l+=Rt(e.getSeconds());break;default:l+=i??""}c++}}return l}(new Date(r),t,i):null}function Ct(e,t,i,r,n){let o=V;if("regular"===e.exit||"accessible"===e.exit){const i="regular"===e.exit?"exit":"exit-access";o=nt(i,{ariaLabel:r(`header.${tt[i].labelKey}`),flipX:tt[i].glyphPointsTo!==t})}else if(e.exit&&function(e){return"string"==typeof e&&e in rt}(e.exit)){const i=rt[e.exit];o=function(e,t){const i=t.flipX?"retro-station-header__mdi retro-station-header__mdi--flip-x":"retro-station-header__mdi";return K`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t.ariaLabel}>
    <ha-icon class=${i} icon=${e}></ha-icon>
  </span>`}(e.exit,{ariaLabel:r(`header.${i.labelKey}`),flipX:void 0!==i.glyphPointsTo&&i.glyphPointsTo!==t})}const a=e.text?K`<span class="retro-station-header__text">${e.text}</span>`:V,s=e=>nt(e,{ariaLabel:r(`header.${tt[e].labelKey}`)}),l=e.show_wc?s("wc"):V,c=e.show_escalator?s("escalator"):V,d=e.show_elevator?s("elevator"):V,h=(e.extra_icons??[]).map(e=>K`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${e}>
    <ha-icon class="retro-station-header__mdi" icon=${e}></ha-icon>
  </span>`),p=[...h].reverse(),u=(e.chips??[]).map(e=>K`<span class="retro-station-header__chip">${e}</span>`),_=[...u].reverse(),f=e.show_clock?function(e){if(!e)return null;const t=Date.parse(e);if(!Number.isFinite(t))return null;const i=new Date(t);return`${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`}(i):null,m=f?K`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${f}</span>
      </span>`:V,g=e.show_date?Tt(i,e.date_format??"d.m.Y",n):null,w=g?K`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${g}</span
      >`:V;return"left"===t?K`${o}${a}${d}${c}${l}${h}${u}${w}${m}`:K`${m}${w}${_}${p}${l}${c}${d}${a}${o}`}const Lt=[["A","A","B"],["B","B","A"],["A","B","B"],["B","A","A"],["A","B","A"],["B","A","B"]],Ht=[100,250],Mt=[200,500],Dt=[500,900],Pt=[.25,.5,.75],Bt=[3,2.5,2.5];function Wt(e){const t=(e,t)=>e+Math.random()*(t-e),i=Math.random()<.5?"A":"B",r=Math.random()<.3?"A"===i?"B":"A":i,n=Lt.filter(e=>e[2]===r),o=n[Math.floor(Math.random()*n.length)],a=Math.random(),s=a<.4?t(Ht[0],Ht[1]):a<.75?t(Mt[0],Mt[1]):t(Dt[0],Dt[1]),l=t(2400,2700),c=l+s,d=l*t(1.08,1.15),h=c*t(1.08,1.15),p="A"===i?d:h,u="B"===i?d:h,_="A"===i?l:c,f="B"===i?l:c,m=e.a,g=e.b,w=e.finishCqw,b=Math.max(m,g),y=Math.max(20,92-b),v=(e,t)=>{const i=b+Pt[t]*y,r=o[t]===e,n=Bt[t];return a=.6,i+(r?n:-n)+(2*Math.random()-1)*a;var a},x=v("A",0),k=v("A",1),$=v("A",2),S=v("B",0),A=v("B",1),z=v("B",2),E=(e,t,i)=>{const r=w-i,n=e-.75*t;if(r<=0||n<=1)return Math.max(i+5,102);const o=i+.25*r*t/n;return Math.max(102,Math.min(135,o))},R=E(_,p,$),T=E(f,u,z),C=(e,t,i,r,n,o)=>{const a=[[0,.25,e,t],[.25,.5,t,i],[.5,.75,i,r],[.75,1,r,n]];for(const[e,t,i,r]of a){if(i>=w)return e*o;if(r>=w){return(e+(w-i)/(r-i)*(t-e))*o}}return Number.POSITIVE_INFINITY},L=C(m,x,k,$,R,p),H=C(g,S,A,z,T,u);return{winner:L<=H?"A":"B",winnerCrossT:Math.min(L,H),cssVars:{"--race-a-duration":`${p}ms`,"--race-b-duration":`${u}ms`,"--race-a-end":R-m+"cqw","--race-b-end":T-g+"cqw","--race-a-x-25":x-m+"cqw","--race-a-x-50":k-m+"cqw","--race-a-x-75":$-m+"cqw","--race-b-x-25":S-g+"cqw","--race-b-x-50":A-g+"cqw","--race-b-x-75":z-g+"cqw"}}}const Nt=a`:host {
display: block;
}
.wl-editor {
display: flex;
flex-direction: column;
}
.wl-tabs {
display: flex;
gap: 2px;
padding: 0 8px;
background: var(--card-background-color);
border-bottom: 1px solid var(--divider-color);
position: sticky;
top: 0;
z-index: 3;
}
.wl-tab {
flex: 1;
min-width: 0;
border: 0;
background: transparent;
cursor: pointer;
padding: 12px 8px 0;
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.2;
letter-spacing: 0.02em;
text-transform: uppercase;
color: var(--secondary-text-color);
}
.wl-tab[aria-selected="true"] {
color: var(--primary-color);
}
.wl-tab-label {
display: block;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
}
.wl-tab-underline {
display: block;
height: 2px;
margin: 7px -8px -1px;
border-radius: 2px 2px 0 0;
background: transparent;
}
.wl-tab[aria-selected="true"] .wl-tab-underline {
background: var(--primary-color);
}
.wl-tab:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-panel {
padding: 14px 16px 22px;
display: flex;
flex-direction: column;
gap: 16px;
}
.wl-panel--stops {
gap: 14px;
}
.wl-section {
border: 1px solid var(--divider-color);
border-radius: 10px;
background: var(--card-background-color);
overflow: hidden;
}
.wl-section-header {
display: flex;
align-items: center;
gap: 8px;
padding: 10px 12px;
background: var(--secondary-background-color);
border-bottom: 1px solid var(--divider-color);
}
.wl-section-title {
flex: 1;
min-width: 0;
font-size: 0.875rem;
font-weight: 500;
line-height: 1.35;
color: var(--primary-text-color);
overflow-wrap: anywhere;
}
.wl-section-hint {
font-size: 0.71875rem;
font-weight: 400;
line-height: 1.35;
color: var(--secondary-text-color);
text-align: right;
}
.wl-section-body {
padding: 6px 12px 12px;
display: flex;
flex-direction: column;
}
.wl-section-body ha-form {
display: block;
}
.wl-group {
display: flex;
flex-direction: column;
gap: 7px;
}
.wl-group-head {
display: flex;
align-items: baseline;
gap: 8px;
}
.wl-label {
font-size: 0.75rem;
font-weight: 400;
line-height: 1.4;
color: var(--secondary-text-color);
}
.wl-label--grow {
flex: 1;
min-width: 0;
}
.wl-note {
font-size: 0.71875rem;
font-weight: 400;
line-height: 1.5;
color: var(--secondary-text-color);
}
.wl-divide {
padding-top: 12px;
border-top: 1px solid var(--divider-color);
}
.wl-chips {
display: flex;
flex-wrap: wrap;
gap: 7px;
}
.wl-chip {
--wl-chip-color: var(--primary-color);
--wl-chip-text: var(--primary-text-color);
--wl-chip-ink: #fff;
position: relative;
display: flex;
align-items: center;
gap: 5px;
height: 34px;
padding: 0 10px;
border-radius: 5px;
border: 2px solid var(--wl-chip-text);
background: transparent;
color: var(--wl-chip-text);
font-size: 0.8125rem;
font-weight: 700;
line-height: 1;
white-space: nowrap;
cursor: pointer;
forced-color-adjust: none;
}
.wl-chip::before {
content: "";
position: absolute;
left: 0;
right: 0;
top: -5px;
bottom: -5px;
}
.wl-chip[aria-pressed="true"] {
background: var(--wl-chip-color);
border-color: var(--wl-chip-color);
color: var(--wl-chip-ink);
}
.wl-chip:hover {
background: color-mix(in srgb, var(--wl-chip-color) 16%, transparent);
}
.wl-chip[aria-pressed="true"]:hover {
background: color-mix(in srgb, var(--wl-chip-color) 88%, #000);
}
.wl-chip:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-chip-mode {
font-size: 0.6875rem;
font-weight: 700;
line-height: 1;
opacity: 0.85;
}
.wl-chip-mode ha-icon {
--mdc-icon-size: 14px;
display: block;
}
.wl-badge {
--wl-chip-ink: #fff;
flex: none;
min-width: 34px;
height: 24px;
padding: 0 7px;
box-sizing: border-box;
border-radius: 5px;
color: var(--wl-chip-ink);
font-size: 0.75rem;
font-weight: 700;
line-height: 24px;
text-align: center;
forced-color-adjust: none;
}
.wl-dirs {
display: flex;
gap: 6px;
flex-wrap: wrap;
}
.wl-dir {
flex: 1;
min-width: 0;
min-height: 34px;
padding: 4px 9px;
border-radius: 6px;
border: 1px solid var(--divider-color);
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.3;
text-align: center;
overflow-wrap: anywhere;
cursor: pointer;
}
.wl-dir[aria-pressed="true"] {
border-color: var(--primary-color);
background: var(--wl-ripple);
color: var(--primary-color);
}
.wl-dir:hover:not([aria-disabled="true"]) {
background: var(--wl-hover);
}
.wl-dir[aria-disabled="true"] {
border-style: dashed;
background: transparent;
color: var(--secondary-text-color);
opacity: 0.65;
cursor: not-allowed;
}
.wl-dir:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-dir--compact {
flex: 1 1 0;
min-width: 44px;
}
.wl-dir--compact ha-icon {
--mdc-icon-size: 16px;
}
.wl-override-row {
display: flex;
align-items: center;
gap: 8px;
flex-wrap: wrap;
}
.wl-override-row .wl-dirs {
flex: 1;
min-width: 0;
gap: 5px;
}
.wl-walk-list {
display: flex;
flex-direction: column;
gap: 6px;
}
.wl-walk-row {
display: flex;
align-items: center;
gap: 8px;
min-height: 44px;
}
.wl-walk-dest {
flex: 1;
min-width: 0;
font-size: 0.8125rem;
font-weight: 400;
line-height: 1.35;
color: var(--primary-text-color);
overflow-wrap: anywhere;
}
.wl-stepper {
display: flex;
align-items: center;
flex: none;
border: 1px solid var(--divider-color);
border-radius: 6px;
overflow: hidden;
background: var(--card-background-color);
}
.wl-step-btn {
width: 34px;
height: 36px;
display: flex;
align-items: center;
justify-content: center;
border: 0;
background: transparent;
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-step-btn ha-icon {
--mdc-icon-size: 18px;
}
.wl-step-btn:hover:not(:disabled) {
background: var(--wl-hover);
}
.wl-step-btn:disabled {
opacity: 0.4;
cursor: not-allowed;
}
.wl-step-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-step-value {
width: 38px;
box-sizing: border-box;
padding: 0 2px;
border: 0;
border-left: 1px solid var(--divider-color);
border-right: 1px solid var(--divider-color);
background: transparent;
color: var(--primary-text-color);
font-size: 0.84375rem;
font-weight: 500;
line-height: 36px;
text-align: center;
font-variant-numeric: tabular-nums;
-moz-appearance: textfield;
appearance: textfield;
}
.wl-step-value::-webkit-outer-spin-button,
.wl-step-value::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}
.wl-step-value:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: -2px;
}
.wl-color-row {
display: flex;
align-items: center;
gap: 8px;
width: 100%;
}
.wl-color-field {
position: relative;
flex: 1;
display: flex;
align-items: center;
gap: 8px;
min-height: 44px;
padding: 0 10px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
cursor: pointer;
}
.wl-swatch {
width: 22px;
height: 22px;
border-radius: 5px;
border: 1px solid var(--divider-color);
forced-color-adjust: none;
}
.wl-color-hex {
font-size: 0.78125rem;
line-height: 1;
font-family: ui-monospace, Menlo, monospace;
color: var(--primary-text-color);
}
.wl-color-input {
position: absolute;
inset: 0;
opacity: 0;
cursor: pointer;
}
.wl-color-field:focus-within {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-icon-btn {
flex: none;
width: 44px;
height: 44px;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-icon-btn:hover:not(:disabled) {
background: var(--wl-hover);
}
.wl-icon-btn:disabled {
opacity: 0.45;
cursor: not-allowed;
}
.wl-icon-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-stop-body {
padding: 12px;
display: flex;
flex-direction: column;
gap: 14px;
}
.wl-index {
flex: none;
width: 22px;
height: 22px;
box-sizing: border-box;
border-radius: 11px;
background: var(--card-background-color);
border: 1px solid var(--divider-color);
color: var(--secondary-text-color);
font-size: 0.6875rem;
font-weight: 600;
line-height: 20px;
text-align: center;
}
.wl-empty {
display: flex;
flex-direction: column;
gap: 4px;
align-items: center;
text-align: center;
padding: 18px 14px;
border: 1px dashed var(--divider-color);
border-radius: 8px;
background: var(--wl-sunken);
}
.wl-empty-title {
font-size: 0.8125rem;
font-weight: 500;
line-height: 1.4;
color: var(--primary-text-color);
}
.wl-add {
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
min-height: 44px;
border: 1px dashed var(--divider-color);
border-radius: 10px;
background: transparent;
color: var(--primary-color);
font-size: 0.84375rem;
font-weight: 500;
line-height: 1;
cursor: pointer;
}
.wl-add:hover {
background: var(--wl-hover);
}
.wl-add:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
@media (forced-colors: active) {
.wl-chip,
.wl-badge,
.wl-swatch {
outline: 1px solid CanvasText;
}
.wl-chip[aria-pressed="true"]:not(:focus-visible),
.wl-dir[aria-pressed="true"]:not(:focus-visible) {
outline: 2px solid Highlight;
outline-offset: -2px;
}
}`,Ot=a`:host {
--wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
--wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
--wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
}`,jt=a`:host {
--wl-signage-housing: #0d0d0d;
--wl-signage-selected: #171717;
--wl-signage-outline: #3a3a3a;
--wl-signage-chip: #2a2a2a;
--wl-signage-ink: #f2f2f2;
}
.wl-strip {
display: flex;
flex-direction: column;
gap: 10px;
padding: 8px 0 4px;
}
.wl-strip-bar {
display: flex;
gap: 6px;
padding: 8px;
border-radius: 10px;
background: var(--wl-signage-housing);
border: 1px solid var(--divider-color);
}
.wl-zone {
flex: 1;
min-width: 0;
display: flex;
align-items: center;
min-height: 44px;
padding: 6px 8px;
border-radius: 6px;
border: 1px dashed var(--wl-signage-outline);
background: transparent;
cursor: pointer;
}
.wl-zone--selected {
border: 2px solid var(--primary-color);
background: var(--wl-signage-selected);
}
.wl-zone:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-zone-tokens {
display: flex;
flex-wrap: wrap;
gap: 5px;
align-items: center;
width: 100%;
}
.wl-zone--right .wl-zone-tokens {
justify-content: flex-end;
}
.wl-token {
display: flex;
align-items: center;
height: 22px;
padding: 0 6px;
border-radius: 3px;
color: var(--wl-signage-ink);
font-size: 0.6875rem;
font-weight: 400;
line-height: 1;
white-space: nowrap;
forced-color-adjust: none;
}
.wl-token ha-icon {
--mdc-icon-size: 16px;
}
.wl-token--chip {
background: var(--wl-signage-chip);
}
.wl-strip-switch {
display: flex;
align-items: center;
gap: 8px;
}
.wl-seg {
display: flex;
gap: 4px;
padding: 3px;
background: var(--secondary-background-color);
border-radius: 8px;
}
.wl-seg-btn {
border: 0;
cursor: pointer;
padding: 8px 12px;
min-height: 34px;
border-radius: 6px;
background: transparent;
color: var(--secondary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1.2;
}
.wl-seg-btn[aria-pressed="true"] {
background: var(--card-background-color);
color: var(--primary-color);
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
}
.wl-seg-btn:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-slot {
display: flex;
flex-direction: column;
gap: 12px;
padding: 12px;
border: 1px solid var(--primary-color);
border-radius: 10px;
background: var(--wl-sunken);
}
.wl-pict-grid,
.wl-tray {
display: flex;
flex-wrap: wrap;
gap: 6px;
}
.wl-pict {
width: 44px;
height: 44px;
display: flex;
align-items: center;
justify-content: center;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
cursor: pointer;
}
.wl-pict ha-icon,
.wl-tray-btn ha-icon,
.wl-pill ha-icon {
--mdc-icon-size: 18px;
}
.wl-pict[aria-pressed="true"],
.wl-tray-btn[aria-pressed="true"] {
border-color: var(--primary-color);
background: var(--wl-ripple);
color: var(--primary-color);
}
.wl-pict:hover,
.wl-tray-btn:hover {
background: var(--wl-hover);
}
.wl-pict:focus-visible,
.wl-tray-btn:focus-visible,
.wl-pill-x:focus-visible,
.wl-text:focus-visible {
outline: 2px solid var(--primary-color);
outline-offset: 2px;
}
.wl-tray-btn {
display: flex;
align-items: center;
gap: 6px;
min-height: 44px;
padding: 0 12px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
font-weight: 500;
line-height: 1;
cursor: pointer;
}
.wl-text {
width: 100%;
box-sizing: border-box;
min-height: 44px;
padding: 0 12px;
border: 1px solid var(--divider-color);
border-radius: 8px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.8125rem;
line-height: 1.4;
}
.wl-pill {
display: flex;
align-items: center;
gap: 6px;
min-height: 36px;
padding: 0 6px 0 11px;
border: 1px solid var(--divider-color);
border-radius: 18px;
background: var(--card-background-color);
color: var(--primary-text-color);
font-size: 0.78125rem;
line-height: 1;
}
.wl-pill-x {
width: 24px;
height: 24px;
display: flex;
align-items: center;
justify-content: center;
border: 0;
border-radius: 12px;
background: var(--wl-hover);
color: var(--secondary-text-color);
cursor: pointer;
}
.wl-pill-x ha-icon {
--mdc-icon-size: 14px;
}
@media (forced-colors: active) {
.wl-strip-bar,
.wl-zone {
forced-color-adjust: none;
}
.wl-strip-bar {
outline: 1px solid CanvasText;
}
.wl-seg-btn[aria-pressed="true"]:not(:focus-visible),
.wl-pict[aria-pressed="true"]:not(:focus-visible),
.wl-tray-btn[aria-pressed="true"]:not(:focus-visible) {
outline: 2px solid Highlight;
outline-offset: -2px;
}
}`;function qt(e,t,i){return K`
    <div class="wl-tabs" role="tablist">
      ${e.map((r,n)=>K`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${r.key}`}
          aria-selected=${t===r.key?"true":"false"}
          aria-controls=${t===r.key?`wl-panel-${r.key}`:V}
          tabindex=${t===r.key?"0":"-1"}
          @click=${()=>i(r.key)}
          @keydown=${t=>((t,r)=>{const n="ArrowRight"===t.key?1:"ArrowLeft"===t.key?-1:0;if(!n)return;t.preventDefault();const o=(r+n+e.length)%e.length,a=e[o];if(!a)return;i(a.key);const s=t.currentTarget.parentElement,l=s?.children[o];l instanceof HTMLElement&&l.focus()})(t,n)}
        >
          <span class="wl-tab-label">${r.label}</span>
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function Ut(e,t){return K`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?K`<span class="wl-section-hint">${e.hint}</span>`:V}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function Kt(e){return Ut(e,K`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}const Ft=be(class extends ye{constructor(e){if(super(e),e.type!==ge&&e.type!==me&&e.type!==we)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===I||t===V)return t;const i=e.element,r=e.name;if(e.type===ge){if(t===i[r])return I}else if(e.type===we){if(!!t===i.hasAttribute(r))return I}else if(e.type===me&&i.getAttribute(r)===t+"")return I;return ke(e),t}});function It(e){"Escape"!==e.key&&"Tab"!==e.key&&e.stopPropagation()}const Vt=[{key:"show_wc",icon:"mdi:human-male-female",labelKey:"show_wc_short"},{key:"show_escalator",icon:"mdi:escalator",labelKey:"show_escalator_short"},{key:"show_elevator",icon:"mdi:elevator",labelKey:"show_elevator_short"},{key:"show_clock",icon:"mdi:clock-outline",labelKey:"show_clock_short"},{key:"show_date",icon:"mdi:calendar",labelKey:"show_date_short"}],Gt=[{value:"regular",icon:"mdi:exit-run",labelKey:"header_exit_regular"},{value:"accessible",icon:"mdi:wheelchair-accessibility",labelKey:"header_exit_accessible"},...it.map(e=>({value:e,icon:e,labelKey:rt[e].labelKey})),{value:"none",icon:"mdi:close-circle-outline",labelKey:"header_exit_none"}];function Zt(e,t){const i=("header_left"===e.selected?e.left:e.right)??{},r=e.et("header_slot_empty"),n=(i,r)=>t.patch(e.selected,i,r);return K`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${e.et("header_bar_aria")}>
        ${Yt("header_left",e,t,r)}
        ${Yt("header_right",e,t,r)}
      </div>

      <div class="wl-strip-switch">
        <span class="wl-note wl-label--grow">${e.et("header_pick_side_hint")}</span>
        <div class="wl-seg" role="group" aria-label=${e.et("header_side_aria")}>
          ${["header_left","header_right"].map(i=>K`<button
              type="button"
              class="wl-seg-btn"
              aria-pressed=${e.selected===i?"true":"false"}
              @click=${()=>t.selectSide(i)}
            >
              ${e.et("header_left"===i?"header_left":"header_right")}
            </button>`)}
        </div>
      </div>

      <div class="wl-slot">
        <div class="wl-group">
          <span class="wl-label">${e.et("exit")}</span>
          <div class="wl-pict-grid">
            ${Gt.map(t=>{const r=(i.exit??"none")===t.value,o=e.et(t.labelKey);return K`<button
                type="button"
                class="wl-pict"
                aria-pressed=${r?"true":"false"}
                aria-label=${o}
                title=${o}
                @click=${()=>n("exit",t.value)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
              </button>`})}
          </div>
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et("text")}</span>
          <input
            type="text"
            class="wl-text"
            maxlength=${64}
            .value=${i.text??""}
            aria-label=${e.et("text")}
            placeholder=${e.et("text_placeholder")}
            @keydown=${It}
            @keyup=${It}
            @keypress=${It}
            @change=${e=>n("text",e.target.value.trim()||void 0)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et("header_amenities")}</span>
          <div class="wl-tray">
            ${Vt.map(t=>{const r=Boolean(i[t.key]),o=e.et(t.labelKey);return K`<button
                type="button"
                class="wl-tray-btn"
                aria-pressed=${r?"true":"false"}
                aria-label=${o}
                @click=${()=>n(t.key,!r)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
                ${o}
              </button>`})}
          </div>
          ${i.show_date?K`<input
                type="text"
                class="wl-text"
                maxlength=${32}
                .value=${i.date_format??""}
                aria-label=${e.et("date_format")}
                placeholder=${e.et("date_format_placeholder")}
                @keydown=${It}
                @keyup=${It}
                @keypress=${It}
                @change=${e=>n("date_format",e.target.value.trim()||void 0)}
              />`:V}
        </div>

        ${function(e,t,i){const r=e.chips??[],n=e.extra_icons??[];return K`
    <div class="wl-group">
      <span class="wl-label"
        >${t.et("header_chips_and_icons").replace("{chips}",String(6)).replace("{icons}",String(3))}</span
      >
      <div class="wl-tray">
        ${n.map((e,r)=>K`<span class="wl-pill">
            <ha-icon icon=${e} aria-hidden="true"></ha-icon>
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et("remove_icon_aria").replace("{icon}",e)}
              @click=${()=>i("extra_icons",Qt(n,r))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
        ${r.map((e,n)=>K`<span class="wl-pill">
            ${e}
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et("remove_chip_aria").replace("{chip}",e)}
              @click=${()=>i("chips",Qt(r,n))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
      </div>

      ${n.length<3?K`<ha-icon-picker
            .value=${Ft("")}
            .label=${t.et("add_icon")}
            @value-changed=${e=>{const t=e.detail?.value;t&&i("extra_icons",[...n,t].slice(0,3))}}
          ></ha-icon-picker>`:V}
      ${r.length<6?K`<input
            type="text"
            class="wl-text"
            maxlength=${16}
            aria-label=${t.et("add_chip")}
            placeholder=${t.et("add_chip")}
            @keydown=${e=>{if(It(e),"Enter"!==e.key)return;const t=e.target,n=t.value.trim();n&&(i("chips",[...r,n].slice(0,6)),t.value="")}}
            @keyup=${It}
            @keypress=${It}
          />`:V}
    </div>
  `}(i,e,n)}
      </div>
    </div>
  `}function Yt(e,t,i,r){const n="header_left"===e?t.left:t.right,o=t.selected===e,a=function(e,t,i){const r=[];if(!e)return[{label:t,kind:"text",name:t}];if(e.exit&&"none"!==e.exit){const t=Gt.find(t=>t.value===e.exit);r.push({label:"",icon:t?.icon??e.exit,kind:"icon",name:t?i(t.labelKey):e.exit})}e.text&&r.push({label:e.text,kind:"text",name:e.text});for(const t of Vt)e[t.key]&&r.push({label:"",icon:t.icon,kind:"icon",name:i(t.labelKey)});for(const t of e.extra_icons??[])r.push({label:"",icon:t,kind:"icon",name:t});for(const t of e.chips??[])r.push({label:t,kind:"chip",name:t});return r.length||r.push({label:t,kind:"text",name:t}),r}(n,r,t.et),s=t.et("header_left"===e?"header_left":"header_right");return K`<button
    type="button"
    class=${ve({"wl-zone":!0,"wl-zone--selected":o,"wl-zone--right":"header_right"===e})}
    aria-pressed=${o?"true":"false"}
    aria-label=${`${s}: ${a.map(e=>e.name).join(", ")}`}
    @click=${()=>i.selectSide(e)}
  >
    <span class="wl-zone-tokens">
      ${a.map(e=>K`<span
          class=${ve({"wl-token":!0,"wl-token--chip":"chip"===e.kind})}
          >${e.icon?K`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}</span
        >`)}
    </span>
  </button>`}function Qt(e,t){const i=e.filter((e,i)=>i!==t);return i.length?i:void 0}function Xt(e){return{background:e.fill,...e.ink?{"--wl-chip-ink":e.ink}:{}}}const Jt=120;function ei(e,t,i){const r=new Set;for(const n of e)n.direction===t&&(i&&n.line!==i||n.towards&&r.add(n.towards));return[...r].sort()}function ti(e,t,i,r){const n=function(e,t){return e?.states?.[t]?.attributes}(e,t.entity),o=!n,a=n?.stop_name||t.entity,s=n?.line_colors??{},l=function(e){return!0===e?.themes?.darkMode?"dark":!1===e?.themes?.darkMode?"light":void 0}(e),c=e=>function(e,t,i={},r,n="var(--primary-color)"){const o=wt(e,t,i,n);return{fill:o.background,ink:o.color,text:Ve(o.background,r)??void 0}}(e,i.lineColorOverrides,s,l,"#5b6470"),d=new Set(t.lines??[]),h=function(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}(n),p=d.size?[...new Set([...h,...d])].sort():h,u=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=String(r.direction??""),n=`${r.line}|${e}|${r.towards}`;i.has(n)||(i.add(n),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(n),_=new Map;for(const e of n?.departures??[])e.line&&e.type&&!_.has(e.line)&&_.set(e.line,e.type);const f=e=>({full:i.t("H"===e?"dir_h":"dir_r"),short:i.t("H"===e?"dir_h_short":"dir_r_short")});return K`
    <section class="wl-section">
      <header class="wl-section-header">
        ${i.total>1?K`<span class="wl-index" aria-hidden="true">${i.index}</span>`:V}
        <span class="wl-section-title">${a}</span>
      </header>
      <div class="wl-stop-body">
        ${o?function(e,t,i){return K`
    <ha-alert alert-type="error">
      ${t.t("entity_missing").replace("{entity}",e.entity)}
      ${i.remove?K`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>i.remove?.(e.entity)}
          >
            ${t.et("remove_stop")}
          </button>`:V}
    </ha-alert>
  `}(t,i,r):V}
        ${function(e,t,i,r){const{lines:n,picked:o,colorOf:a,typeByLine:s}=r,l=o.size?t.et("lines_selected").replace("{n}",String(o.size)).replace("{total}",String(n.length)):t.et("lines_empty_means_all");return K`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("lines_label")}</span>
        ${n.length?K`<span class="wl-note">${l}</span>`:V}
      </div>
      ${n.length?K`<div class="wl-chips">
            ${n.map(r=>{const n=t.singleLine?o.has(r):0===o.size||o.has(r),l=function(e){switch(e){case At:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}(s.get(r));return K`<button
                type="button"
                class="wl-chip"
                style=${ze(function(e){return{"--wl-chip-color":e.fill,...e.text?{"--wl-chip-text":e.text}:{},...e.ink?{"--wl-chip-ink":e.ink}:{}}}(a(r)))}
                aria-pressed=${n?"true":"false"}
                aria-label=${t.et(n?"line_active_aria":"line_inactive_aria").replace("{line}",r)}
                @click=${()=>i.toggleLine(e.entity,r)}
              >
                ${l?K`<span class="wl-chip-mode"
                      ><ha-icon icon=${l} aria-hidden="true"></ha-icon
                    ></span>`:V}
                ${r}
              </button>`})}
          </div>`:K`<div class="wl-empty">
            <span class="wl-empty-title">${t.et("no_lines_title")}</span>
            <span class="wl-note">${t.et("no_lines_hint")}</span>
          </div>`}
    </div>
  `}(t,i,r,{lines:p,picked:d,colorOf:c,typeByLine:_})}
        ${!o&&p.length?function(e,t){return!e.singleLine&&kt(t.lines,t.picked).length>=2}(i,{lines:p,picked:d})?function(e,t,i,r){const{attrs:n,triplets:o,picked:a,lines:s,colorOf:l,dirStrings:c}=r,d=kt(s,a),h=e.line_directions??{},p=e.direction??null,u=e=>h[e]??p,_=(t,r)=>{const n={};for(const e of d){const i=e===t?r:u(e);i&&(n[e]=i)}for(const[e,t]of Object.entries(h))d.includes(e)||(n[e]=t);i.setDirections(e.entity,{direction:null,lineDirections:n})};return K`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      ${d.map(e=>{const i=xt(n,e),r=u(e),a=i.available.has("H"),s=i.available.has("R"),d=null!==i.oneWay,h=i.unknown,p=i=>t.et("per_line_direction_aria").replace("{line}",e).replace("{direction}",null===i?t.t("dir_both"):yt(ei(o,i,e),c(i)));return K`
          <div class="wl-override-row">
            <span class="wl-badge" style=${ze(Xt(l(e)))}
              >${e}</span
            >
            <div class="wl-dirs">
              ${ii({label:c("H").short,active:"H"===r||null===r&&"H"===i.oneWay,disabled:!h&&!a,compact:!0,title:ei(o,"H",e).join(" / ")||t.t("dir_h"),ariaLabel:p("H"),onClick:()=>_(e,"H")})}
              ${ii({label:c("R").short,active:"R"===r||null===r&&"R"===i.oneWay,disabled:!h&&!s,compact:!0,title:ei(o,"R",e).join(" / ")||t.t("dir_r"),ariaLabel:p("R"),onClick:()=>_(e,"R")})}
              ${ii({label:"",icon:"mdi:swap-horizontal",active:null===r&&!d,disabled:d,compact:!0,title:t.t("dir_both"),ariaLabel:p(null),onClick:()=>_(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}(t,i,r,{attrs:n,triplets:u,picked:d,lines:p,colorOf:c,dirStrings:f}):function(e,t,i,r){const{attrs:n,triplets:o,picked:a,lines:s,dirStrings:l}=r,c=kt(s,a),d=1===c.length?c[0]:void 0,h=e.direction??null,p=xt(n,d),u=p.available.has("H"),_=p.available.has("R"),f=null!==p.oneWay,m="H"===h||null===h&&"H"===p.oneWay,g="R"===h||null===h&&"R"===p.oneWay,w=null===h&&!f,b=t=>{const r={};for(const[t,i]of Object.entries(e.line_directions??{}))c.includes(t)||(r[t]=i);i.setDirections(e.entity,{direction:t,lineDirections:r})},y=e=>p.unknown||p.available.has(e)?yt(ei(o,e,d),l(e)):`${l(e).short}: ${t.et("direction_not_served")}`,v=null!==p.oneWay&&1===c.length?t.et("direction_note_one_way").replace("{line}",c[0]??""):"";return K`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      <div class="wl-dirs">
        ${ii({label:y("H"),active:m,disabled:!p.unknown&&!u,title:u||p.unknown?t.t("dir_h"):t.et("direction_unavailable"),onClick:()=>b("H")})}
        ${ii({label:y("R"),active:g,disabled:!p.unknown&&!_,title:_||p.unknown?t.t("dir_r"):t.et("direction_unavailable"),onClick:()=>b("R")})}
        ${t.singleLine?V:ii({label:t.t("dir_both"),active:w,disabled:f,title:f?t.et("direction_unavailable"):t.t("dir_both"),onClick:()=>b(null)})}
      </div>
      ${v?K`<span class="wl-note">${v}</span>`:V}
    </div>
  `}(t,i,r,{attrs:n,triplets:u,picked:d,lines:p,dirStrings:f}):V}
        ${o?V:function(e,t,i,r){const{attrs:n,picked:o,colorOf:a,lines:s,dirStrings:l}=r,c=e.line_directions??{},d=e.direction??null,h=St(n,{lines:s,picked:o,lineDirections:c,stopDirection:d});return h.length?K`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("section_walk_time")}</span>
        <span class="wl-note">${t.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${t.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${h.map(r=>{const n=bt(r.line,r.direction),o=e.walk_times?.[n],s=r.termini.length?r.termini.join(" / "):"H"===r.direction||"R"===r.direction?l(r.direction).full:"",c=t.et("walk_time_aria").replace("{line}",r.line).replace("{towards}",s),d=t=>{const r=(o??0)+t;i.setWalkTime(e.entity,n,r<1?null:Math.min(Jt,r))};return K`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${ze(Xt(a(r.line)))}
                >${r.line}</span
              >
              <span
                class="wl-walk-dest"
                title=${r.termini.length>1?t.et("walk_time_branching_hint"):s}
                >→ ${s}</span
              >
              <span class="wl-stepper">
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${void 0===o}
                  aria-label=${t.et("walk_time_less_aria").replace("{line}",r.line)}
                  @click=${()=>d(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${Jt}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et("walk_time_placeholder")}
                  aria-label=${c}
                  .value=${Ft(void 0!==o?String(o):"")}
                  @keydown=${It}
                  @keyup=${It}
                  @keypress=${It}
                  @change=${t=>i.setWalkTime(e.entity,n,function(e,t){const i=e.trim(),r=""===i?NaN:Number(i);return""===i||Number.isFinite(r)||console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}(t.target.value,`${e.entity}/${n}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(o??0)>=Jt}
                  aria-label=${t.et("walk_time_more_aria").replace("{line}",r.line)}
                  @click=${()=>d(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:V}(t,i,r,{attrs:n,picked:d,colorOf:c,lines:p,dirStrings:f})}
      </div>
    </section>
  `}function ii(e){return K`<button
    type="button"
    class=${ve({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?"true":"false"}
    aria-disabled=${e.disabled?"true":"false"}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{e.disabled?t.preventDefault():e.onClick()}}
  >
    ${e.icon?K`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}function ri(e,t,i){const r={...e??{},[t]:i};return void 0===i&&delete r[t],r}
// Lovelace editor for the Wiener Linien Austria retro card (v2 editor system).
let ni=class extends ce{constructor(){super(...arguments),this._tab="stops",this._headerSide="header_left",this._pendingDirectionFix=!1,this._onEntityChanged=e=>{if(e.stopPropagation(),!this._config)return;const t=e.detail.value.entity,i="string"==typeof t?t:void 0;if(i===this._config.entity)return;const r={...this._config,entity:i},n=this._availableDirections(i);1===n.size&&(r.direction=n.has("H")?"H":"R"),r.line=vt(this._attrs(i),r.direction)[0],this._commit(r)},this._computeLabel=e=>function(e,t,i){const r=t.et(i);return r!==i?r:e?.localize?.(`ui.panel.lovelace.editor.card.generic.${i}`)||i}(this.hass,this._i18n,e.name),this._computeHelper=e=>{const{et:t}=this._i18n;return function(e,t,i){const r=i?.[t];if(void 0!==r)return r;const n=`${t}_helper`,o=e.et(n);return o===n?void 0:o}(this._i18n,e.name,{...this._config?.message_ticker?{}:{message_text:t("message_text_requires")},...this._config?.show_platform?{}:{platform_side:t("platform_side_requires")}})}}setConfig(e){this._config=gt(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_tab")||e.has("_headerSide"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entity;return!i||t.states[i]!==this.hass.states[i]}willUpdate(e){(e.has("_config")||e.has("hass"))&&this._scheduleDirectionAutocorrect()}get _i18n(){return function(e,t){const i={hassLanguage:t};return{t:t=>qe(`${e}.${t}`,i),et:t=>{const r=`${e}.editor.${t}`,n=qe(r,i);if(n!==r)return n;const o=`common.editor.${t}`,a=qe(o,i);return a===o?t:a}}}("retro",this.hass?.language)}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_patch(e){this._config&&this._commit(gt({...this._config,...e}))}get _stopView(){const e=this._config;return{entity:e.entity??"",lines:e.line?[e.line]:[],direction:e.direction,walk_times:e.walk_times}}get _stopCallbacks(){return{toggleLine:(e,t)=>{if(!this._config)return;const i={...this._config};i.line===t?delete i.line:i.line=t,this._commit(i)},setDirections:(e,t)=>{if(!this._config||null===t.direction)return;const i={...this._config,direction:t.direction},r=vt(this._attrs(i.entity),t.direction);i.line&&r.includes(i.line)||(i.line=r[0]),this._commit(i)},setWalkTime:(e,t,i)=>{if(!this._config)return;const r={...this._config.walk_times??{}};null===i?delete r[t]:r[t]=i;const n={...this._config};Object.keys(r).length?n.walk_times=r:delete n.walk_times,this._commit(n)}}}render(){if(!this._config)return V;const{et:e}=this._i18n;return K`
      <div class="wl-editor">
        ${qt([{key:"stops",label:e("tab_stop")},{key:"display",label:e("tab_display")},{key:"tweaks",label:e("tab_tweaks")}],this._tab,e=>{this._tab=e})}
        ${t=this._tab,i=this._renderActiveTab(),K`
    <div
      class=${"stops"===t?"wl-panel wl-panel--stops":"wl-panel"}
      role="tabpanel"
      id=${`wl-panel-${t}`}
      aria-labelledby=${`wl-tab-${t}`}
    >
      ${i}
    </div>
  `}
      </div>
    `;var t,i}_renderActiveTab(){switch(this._tab){case"stops":return this._renderStop();case"display":return this._renderDisplay();case"tweaks":return this._renderTweaks()}}_renderStop(){const e=this._config,{t:t,et:i}=this._i18n;return K`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:e.entity}}
        .schema=${[{name:"entity",required:!0,selector:{entity:{filter:{domain:"sensor",integration:"wiener_linien_austria"}}}}]}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onEntityChanged}
      ></ha-form>
      ${e.entity?ti(this.hass,this._stopView,{index:1,total:1,singleLine:!0,lineColorOverrides:{},t:t,et:i},this._stopCallbacks):V}
    `}_renderDisplay(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return K`
      ${Ut({title:t("section_header"),hint:t("section_header_hint")},K`
          <ha-form
            .hass=${this.hass}
            .data=${{show_header:e.show_header}}
            .schema=${[{name:"show_header",selector:{boolean:{}}}]}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${e=>{e.stopPropagation(),this._patch(e.detail.value)}}
          ></ha-form>
          ${e.show_header?Zt({left:e.header_left,right:e.header_right,selected:this._headerSide,et:t},{selectSide:e=>{this._headerSide=e},patch:(e,t,i)=>this._patchHeaderSide(e,t,i)}):V}
        `)}
      ${Kt({...i,title:t("section_station"),data:{show_station_name:e.show_station_name,station_bg:e.station_bg},schema:[{name:"show_station_name",selector:{boolean:{}}},{name:"station_bg",selector:{select:{mode:"dropdown",options:[{value:"default",label:t("station_bg_default")},{value:"white",label:t("station_bg_white")},{value:"black",label:t("station_bg_black")}]}}}]})}
      ${Kt({...i,title:t("section_departure_row"),hint:t("section_led_panel"),data:{show_platform:e.show_platform,platform_side:e.platform_side,accessibility_only:e.accessibility_only},schema:[{name:"show_platform",selector:{boolean:{}}},{name:"platform_side",disabled:!e.show_platform,selector:{select:{mode:"dropdown",options:[{value:"auto",label:t("platform_side_auto")},{value:"left",label:t("platform_side_left")},{value:"right",label:t("platform_side_right")}]}}},{name:"accessibility_only",selector:{boolean:{}}}]})}
      ${Kt({...i,title:t("section_extras"),hint:t("section_extras_hint"),data:{message_ticker:e.message_ticker,message_text:e.message_text??"",wheelchair_race:e.wheelchair_race},schema:[{name:"message_ticker",selector:{boolean:{}}},{name:"message_text",disabled:!e.message_ticker,selector:{text:{}}},{name:"wheelchair_race",selector:{boolean:{}}}]})}
    `}_renderTweaks(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return K`
      ${Kt({...i,title:t("section_led_panel"),data:{size:e.size,style:e.style,show_unit:e.show_unit,show_line_pill:e.show_line_pill,line_stripe:e.line_stripe,housing:e.housing,flicker:e.flicker},schema:[{name:"size",selector:{select:{mode:"dropdown",options:[{value:"small",label:t("size_small")},{value:"medium",label:t("size_medium")},{value:"regular",label:t("size_regular")}]}}},{name:"style",selector:{select:{mode:"dropdown",options:[{value:"classic",label:t("style_classic")},{value:"warm",label:t("style_warm")},{value:"pixel",label:t("style_pixel")}]}}},{name:"show_unit",selector:{boolean:{}}},{name:"show_line_pill",selector:{boolean:{}}},{name:"line_stripe",selector:{boolean:{}}},{name:"housing",selector:{boolean:{}}},{name:"flicker",selector:{boolean:{}}}]})}
    `}_patchHeaderSide(e,t,i){this._config&&this._patch({[e]:ri(this._config[e],t,i)})}_availableDirections(e=this._config?.entity){return xt(this._attrs(e)).available}_scheduleDirectionAutocorrect(){if(!this._config||this._pendingDirectionFix)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";this._config.direction!==t&&(this._pendingDirectionFix=!0,Promise.resolve().then(()=>{try{if(!this._config)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";if(this._config.direction===t)return;const i={...this._config,direction:t},r=vt(this._attrs(i.entity),t);i.line&&r.includes(i.line)||(i.line=r[0]),console.info(`[wiener-linien-austria-retro-card-editor] direction autocorrected to "${t}" for entity "${i.entity??""}" — only one direction has live data`),this._commit(i)}finally{this._pendingDirectionFix=!1}}))}static{this.styles=[Ot,Nt,jt]}};e([_e({attribute:!1})],ni.prototype,"hass",void 0),e([fe()],ni.prototype,"_config",void 0),e([fe()],ni.prototype,"_tab",void 0),e([fe()],ni.prototype,"_headerSide",void 0),ni=e([he("wiener-linien-austria-retro-card-editor")],ni);const oi=800,ai=3e5;{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-retro-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-retro-card",name:"Wiener Linien Austria — Retro",description:"LED-Anzeige im Stil der Wiener-Linien-Stationen",preview:!0,getEntitySuggestion:(e,t)=>t.startsWith("sensor.")?"wiener_linien_austria"!==e?.entities?.[t]?.platform?null:{config:{type:"custom:wiener-linien-austria-retro-card",entity:t}}:null})}let si=class extends ce{constructor(){super(...arguments),this._versionMismatch=null,this._raceState="idle",this._countdownDigit=null,this._raceWinner=null,this._tickerActive=!1,this._tickerTimer=null,this._viaPhase="towards",this._viaTimer=null,this._anyViaInRows=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._cachedEid=null,this._raceTimers=new Set,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._handleCardClick=()=>{if(this._tickerActive)return this._tickerActive=!1,void this._scheduleTicker(ai);this._config?.wheelchair_race&&"idle"===this._raceState&&("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._clearRaceTimers(),this._startRace()))},this._handleCardKeydown=e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleCardClick())},this._onTickerDone=()=>{this._tickerActive=!1,this._scheduleTicker(ai)}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-retro-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-retro-card: 'entity' must be a string");if("string"==typeof e.entity&&e.entity&&!e.entity.startsWith("sensor."))throw new Error(`wiener-linien-austria-retro-card: 'entity' must be in the sensor domain (got "${e.entity}")`);this._config=gt(e),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer(),this._raceState="idle",this._countdownDigit=null,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null,this._tickerActive=!1,this._fallbackWarned=!1,this._cachedEid=null}getCardSize(){return 2}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:2}}static getConfigElement(){return document.createElement("wiener-linien-austria-retro-card-editor")}static getStubConfig(e){const t=zt(e)[0]||"";let i="H";const r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){const e=r.some(e=>"H"===e.direction),t=r.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i,size:"small"}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(Et))return;const e=document.createElement("style");e.id=Et,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),"undefined"!=typeof document&&document.fonts?.ready&&document.fonts.ready.then(()=>{document.fonts.check('700 16px "WL Mono"')||console.warn('[wiener-linien-austria-retro-card] "WL Mono" 700 not loaded — falling back to Courier New (less authentic). Check /wiener-linien-austria/fonts/ is served by the integration.')}).catch(e=>{console.warn("[wiener-linien-austria-retro-card] document.fonts.ready rejected",e)}),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),"idle"!==this._raceState&&(this._config?.wheelchair_race?this._armStateTransitions():(this._raceState="idle",this._clearRaceTimers())),this._config?.message_ticker&&this._config?.message_text&&this._scheduleTicker(ai)}disconnectedCallback(){super.disconnectedCallback(),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_raceState")||e.has("_countdownDigit")||e.has("_raceWinner")||e.has("_tickerActive")||e.has("_viaPhase"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}updated(e){super.updated(e),this._anyViaInRows?this._armViaTimer():null!==this._viaTimer&&this._clearViaTimer()}willUpdate(e){if(!e.has("_config"))return;const t=e.get("_config"),i=!0===t?.wheelchair_race,r=!0===this._config?.wheelchair_race;r&&!i?(this._clearRaceTimers(),this._startRace()):!r&&i&&(this._clearRaceTimers(),this._raceState="idle",this._countdownStartAt=null,this._countdownDigit=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null);const n=!0===t?.message_ticker&&!!t?.message_text,o=!0===this._config?.message_ticker&&!!this._config?.message_text,a=t?.message_text!==this._config?.message_text;!o||n&&!a?!o&&n&&(this._clearTickerTimer(),this._tickerActive=!1):(this._tickerActive=!1,this._scheduleTicker(1500))}_t(e,t){return qe(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/retro_card_version","2.0.0")}catch(e){console.warn("[wiener-linien-austria-retro-card] version probe failed",e)}}_resolveEntity(){const e=this._config?.entity;if(e&&this.hass?.states?.[e])return this._cachedEid=e,e;if(this._cachedEid&&this.hass?.states?.[this._cachedEid])return this._cachedEid;const t=zt(this.hass)[0]??null;return t&&e&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-retro-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)),this._cachedEid=t,t}_clearRaceTimers(){for(const e of this._raceTimers)clearTimeout(e);this._raceTimers.clear()}_scheduleRaceTimer(e,t){const i=setTimeout(()=>{this._raceTimers.delete(i),e()},t);this._raceTimers.add(i)}_scheduleRace(e){this._scheduleRaceTimer(()=>this._startRace(),e)}_clearTickerTimer(){null!==this._tickerTimer&&(clearTimeout(this._tickerTimer),this._tickerTimer=null)}_scheduleTicker(e){this._clearTickerTimer(),this._tickerTimer=setTimeout(()=>{this._tickerTimer=null,this._runTicker()},e)}_runTicker(){this._config?.message_ticker&&this._config?.message_text&&("idle"===this._raceState?"undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?this._scheduleTicker(ai):this._tickerActive=!0:this._scheduleTicker(2e4))}_tickerDurationSeconds(e){return Math.min(40,Math.max(8,5+.18*e.length))}_armViaTimer(){null===this._viaTimer&&(this._viaTimer=setInterval(()=>{this._viaPhase="towards"===this._viaPhase?"via":"towards"},4e3))}_clearViaTimer(){null!==this._viaTimer&&(clearInterval(this._viaTimer),this._viaTimer=null),this._viaPhase="towards"}_startRace(){if(!this._config?.wheelchair_race)return;if("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return void this._scheduleRace(this._nextRaceDelay());if(this._currentBarrierFreeCount()<2)return void this._scheduleRace(this._nextRaceDelay());if(this._tickerActive)return void this._scheduleRace(this._nextRaceDelay());const{winnerCrossT:e}=this._randomizeRaceParams(),t=Date.now();this._raceState="countdown",this._countdownStartAt=t,this._countdownDigit=3,this._raceEndAt=t+2400+e+150,this._freezeEndAt=this._raceEndAt+1500,this._victoryEndAt=this._freezeEndAt+4e3,this._scheduleCountdownTick()}_scheduleCountdownTick(){if("countdown"!==this._raceState||null===this._countdownStartAt)return;const e=Date.now(),t=e-this._countdownStartAt;if(t>=2400)return void this._beginRacing();const i=Math.max(1,Math.min(3,3-Math.floor(t/oi)));this._countdownDigit!==i&&(this._countdownDigit=i);const r=this._countdownStartAt+(Math.floor(t/oi)+1)*oi,n=Math.max(50,r-e);this._scheduleRaceTimer(()=>this._scheduleCountdownTick(),n)}_beginRacing(){this._raceState="racing",this._countdownDigit=null,this._countdownStartAt=null,this._armStateTransitions()}_measureRaceStartPositions(){const e=this.shadowRoot?.querySelector(".retro");if(!e)return null;const t=e.getBoundingClientRect();if(t.width<=0)return null;const i=this.shadowRoot?.querySelectorAll(".retro-row .retro-wheelchair");if(!i||i.length<2)return null;const r=i[0],n=i[1];if(!r||!n)return null;const o=r.getBoundingClientRect(),a=n.getBoundingClientRect(),s=o.left-t.left,l=a.left-t.left,c=100-("small"===this._config?.size?10:14)/t.width*100-o.width/t.width*100;return{a:s/t.width*100,b:l/t.width*100,finishCqw:c}}_randomizeRaceParams(){const e=this._measureRaceStartPositions(),t=Wt({a:e?.a??0,b:e?.b??0,finishCqw:e?.finishCqw??96});this._raceWinner=t.winner;for(const[e,i]of Object.entries(t.cssVars))this.style.setProperty(e,i);return{winnerCrossT:t.winnerCrossT}}_armStateTransitions(){this._clearRaceTimers();const e=Date.now();switch(this._raceState){case"idle":return;case"countdown":return void(null!==this._countdownStartAt&&this._scheduleCountdownTick());case"racing":return void(null!==this._raceEndAt&&this._scheduleRaceTimer(()=>{this._raceState="freeze",this._raceEndAt=null,this._armStateTransitions()},Math.max(0,this._raceEndAt-e)));case"freeze":return void(null!==this._freezeEndAt&&this._scheduleRaceTimer(()=>{this._raceState="victory",this._freezeEndAt=null,this._armStateTransitions()},Math.max(0,this._freezeEndAt-e)));case"victory":return void(null!==this._victoryEndAt&&this._scheduleRaceTimer(()=>{this._raceState="idle",this._victoryEndAt=null,this._config?.wheelchair_race&&this._scheduleRace(this._nextRaceDelay())},Math.max(0,this._victoryEndAt-e)));default:{const e=this._raceState;throw new Error(`unhandled race state: ${String(e)}`)}}}_nextRaceDelay(){return 6e4+12e4*Math.random()}_currentBarrierFreeCount(){if(!this._config)return 0;const e=this._resolveEntity();if(!e||!this.hass)return 0;const t=this.hass.states[e]?.attributes??{};return $t(Array.isArray(t.departures)?t.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,2).filter(e=>e.barrier_free).length}render(){if(!this._config)return V;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},{rows:r,matching:n,departures:o,platform:a,gleisLeft:s,platformLabelKey:l,stopName:c}=function(e,t){const i=Array.isArray(t.departures)?t.departures:[],r=$t(i,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}),n=r.slice(0,et),o=n.find(e=>e.platform)?.platform??null,a=e.show_platform?o:null;let s;switch(e.platform_side){case"left":s=!0;break;case"right":s=!1;break;default:s="2"===a}return{rows:n,matching:r,departures:i,platform:a,gleisLeft:s,platformLabelKey:(n[0]?.type??"")===At?"gleis":"steig",stopName:t.stop_name||t.friendly_name||""}}(e,i),d=this._t(l),h=e.show_station_name&&!!c?this._renderStationName(c,n,o,e.station_bg,i.line_colors??{},e.line):V,p=e.show_header?function(e){const{left:t,right:i,serverTime:r,t:n,lang:o}=e;return t||i?K`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${t?Ct(t,"left",r,n,o):V}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${i?Ct(i,"right",r,n,o):V}
      </div>
    </div>
  `:V}({left:e.header_left,right:e.header_right,serverTime:i.server_time,t:e=>this._t(e),lang:this.hass?.language}):V,u=e.wheelchair_race&&"countdown"===this._raceState,_=e.wheelchair_race&&"racing"===this._raceState,f=e.wheelchair_race&&"freeze"===this._raceState,m=e.wheelchair_race&&"victory"===this._raceState,g=e.wheelchair_race&&"idle"===this._raceState||this._tickerActive,w="A"===this._raceWinner?1:"B"===this._raceWinner?2:null;this._anyViaInRows=r.some(e=>!!e.via);const b={retro:!0,"retro--gleis-left":!!a&&s,"retro--gleis-right":!!a&&!s,"retro--no-gleis":!a,[`retro--size-${e.size}`]:"regular"!==e.size,[`retro--style-${e.style}`]:"classic"!==e.style,"retro--flicker":e.flicker,"retro--race-countdown":u,"retro--race-active":_,"retro--race-freeze":f,"retro--race-victory":m,"retro--clickable":g,"retro--line-pill":e.show_line_pill,"retro--line-stripe":e.line_stripe,"retro--housing":e.housing},y=g?{role:"button",tabindex:"0","aria-label":this._tickerActive?this._t("aria_dismiss_message"):this._t("aria_start_race")}:{};return K`
      <ha-card style="padding:0;overflow:hidden;">
        <div
          class=${ve(b)}
          role=${y.role??V}
          tabindex=${y.tabindex??V}
          aria-label=${y["aria-label"]??V}
          @click=${this._handleCardClick}
          @keydown=${g?this._handleCardKeydown:V}>
          ${Ue(this._versionMismatch,e=>this._t(e),"retro-banner")}
          ${p}
          ${h}
          <div class="retro-led">
            ${this._renderMain(t,r,o,a,d,i.server_time,i.line_colors??{},"number"==typeof i.stale_departures?i.stale_departures:0)}
            ${this._tickerActive&&e.message_text?K`<div class="retro-ticker" role="status" aria-live="polite">
                  <div
                    class="retro-ticker-text"
                    style=${`animation-duration:${this._tickerDurationSeconds(e.message_text)}s`}
                    @animationend=${this._onTickerDone}
                  >
                    ${e.message_text}
                  </div>
                </div>`:V}
            ${u&&null!==this._countdownDigit?K`<div class="retro-countdown" role="status" aria-live="polite">
                  ${$e(this._countdownDigit,K`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`)}
                  <span class="retro-victory-sr">
                    ${this._t("race_starting_in",{n:this._countdownDigit})}
                  </span>
                </div>`:V}
            ${u||_||f?K`<div class="retro-finish-line" aria-hidden="true"></div>`:V}
            ${m?K`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${null!==w?K`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${w}</span>
                      </div>`:V}
                  <span class="retro-victory-sr">
                    ${null!==w?this._t("race_winner_announce",{n:w}):this._t("race_finished")}
                  </span>
                </div>`:V}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,i,r,n,o,a,s){if(!e)return K`<div class="retro-empty" role="status" aria-live="polite">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,r=i.filter(t=>t.direction===e);let n="no_data";return 0===i.length&&s>0?n="stale_feed":0===i.length&&o?n="betriebsschluss":i.length>0&&0===r.length?n="no_data_wrong_direction":t&&r.length>0&&(n="no_data_wrong_line"),K`<div class="retro-empty" role="status" aria-live="polite">${this._t(n)}</div>`}return K`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${t.map((e,t)=>this._renderRow(e,t,a))}
      </ul>
      ${r?this._renderGleis(r,n):V}
    `}_renderRow(e,t,i){const r=Number.isFinite(e.countdown)?e.countdown:null,n=null!==r&&r<=0,o=e.line||"?",a=e.towards||"",s="string"==typeof e.via&&e.via.trim()?e.via.trim():null,l=null===r?this._t("no_data"):n?this._t("at_platform"):this._t("countdown_minutes",{n:String(r)}),c=e.barrier_free?this._t("barrier_free_title"):"",d=[o,a,s?`${this._t("via_prefix")} ${s}`:"",l,c].filter(Boolean).join(" — "),h=wt(o,{},i),p="var(--primary-color)"!==h.background,u=p?h.background:"var(--led-amber)",_=h.color??(p?"#fff":"var(--led-bg)"),f=ze({"--row-i":String(t),"--retro-line-color":u,"--retro-line-fg":_}),m=!!s;return K`
      <li class="retro-row" style=${f} aria-label=${d}>
        <div class="retro-line" aria-hidden="true">
          <span class="retro-line__label">${o}</span>
        </div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-stack">
            <span class="retro-dest-text retro-dest-text--layout">${Ee(a)}</span>
            ${m?K`
                  <span
                    class=${ve({"retro-dest-text":!0,"retro-dest-text--absolute":!0,"retro-dest-text--visible":"towards"===this._viaPhase})}
                  >${Ee(a)}</span>
                  <span
                    class=${ve({"retro-dest-text":!0,"retro-dest-text--absolute":!0,"retro-dest-text--via":!0,"retro-dest-text--visible":"via"===this._viaPhase})}
                  >${this._t("via_prefix")} ${Ee(s)}</span>
                `:V}
          </span>
          ${e.barrier_free?K`<ha-icon
                class="retro-wheelchair"
                icon="mdi:wheelchair-accessibility"
                title=${this._t("barrier_free_title")}
              ></ha-icon>`:V}
        </div>
        <div class="retro-cd" aria-hidden="true">
          ${null===r?"--":n?K`<span class="retro-stars"><span>*</span><span>*</span></span>`:this._config?.show_unit?K`<span class="retro-cd-num">${r}</span><span class="retro-cd-unit">${this._t("unit_min")}</span>`:String(r)}
        </div>
      </li>
    `}_renderGleis(e,t){return K`
      <div class="retro-gleis">
        <div class="retro-gleis-label">${t}</div>
        <div class="retro-gleis-number">${e}</div>
      </div>
    `}_renderStationName(e,t,i,r,n,o){let a,s;if("white"===r)a="#fff",s="#000";else if("black"===r)a="#000",s="#fff";else{const e=t.length?t:i,r=o||e[0]?.line;if(r){const e=wt(r,{},n);a=e.background,s=e.color??"#fff","var(--primary-color)"===a&&(a="#fff",s="#000")}else a="#fff",s="#000"}return K`
      <div class="retro-station" style=${ze({background:a,color:s})}>
        <div class="retro-station-name">${Ee(e)}</div>
      </div>
    `}static{this.styles=a`:host {
display: block;
isolation: isolate;
}
.retro {
--led-amber: #FFC700;
--led-bg: #000;
--led-substrate: #1a0d2a;
--led-glow-rgb: 255 199 0;
--led-dot-size: 0.5px;
--led-dot-edge: 1px;
--led-dot-pitch: 4px;
--retro-pad-y: 14px;
--retro-pad-r: 22px;
--retro-pad-l: 22px;
container-type: inline-size;
position: relative;
display: flex;
flex-direction: column;
font-family: "WL Mono", "Courier New", Courier, monospace;
font-weight: 700;
letter-spacing: 0.08em;
overflow: hidden;
min-height: 110px;
}
.retro-led {
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
position: relative;
}
.retro-line {
font-weight: 400;
text-align: left;
transition: opacity 0.15s ease-out;
}
.retro--line-pill .retro-line {
display: inline-flex;
align-items: baseline;
justify-content: center;
box-sizing: border-box;
font-weight: 700;
text-align: center;
min-width: 2em;
padding: 0.08em 0.4em;
border-radius: 0.18em;
background: var(--retro-line-color, transparent);
color: var(--retro-line-fg, var(--led-amber));
text-shadow: none;
box-shadow: 0 0 6px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.4));
}
.retro--line-pill .retro-line__label {
display: inline-block;
}
.retro-dest {
display: flex;
align-items: center;
gap: 0.35em;
text-transform: uppercase;
min-width: 0;
transition: opacity 0.15s ease-out;
}
.retro-dest-stack {
position: relative;
display: inline-block;
overflow: hidden;
flex: 0 1 auto;
min-width: 0;
max-width: 100%;
}
.retro-dest-text {
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
min-width: 0;
max-width: 100%;
display: block;
}
.retro-dest-text--layout {
visibility: visible;
}
.retro-dest-stack:has(.retro-dest-text--absolute) .retro-dest-text--layout {
visibility: hidden;
}
.retro-dest-text--absolute {
position: absolute;
inset: 0;
opacity: 0;
transition: opacity 0.4s ease-in-out;
will-change: opacity;
}
.retro-dest-text--visible {
opacity: 1;
}
.retro-wheelchair {
flex: 0 0 auto;
display: inline-flex;
align-items: center;
justify-content: center;
--mdc-icon-size: 0.9em;
width: 0.9em;
height: 0.9em;
color: inherit;
filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
transform: translateY(0.12em);
}
.retro-cd {
font-variant-numeric: tabular-nums;
text-align: right;
min-width: 2.5em;
transition: opacity 0.4s ease-out;
display: inline-flex;
align-items: baseline;
justify-content: flex-end;
gap: 0.25em;
}
.retro-cd-num {
display: inline-block;
}
.retro-cd-unit {
display: inline-block;
font-size: 0.5em;
text-transform: uppercase;
letter-spacing: 0.12em;
opacity: 0.85;
transform: translateY(-0.05em);
}
@container (inline-size < 360px) {
.retro-cd-unit { display: none; }
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
.retro--flicker .retro-row:nth-child(2) .retro-line {
animation-duration: 8.1s;
animation-delay: -2.4s;
}
}
@keyframes retroWheelExit {
0%   { transform: translate(0, 0.18em); animation-timing-function: ease-out; }
25%  { transform: translate(var(--race-x-25, 25cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
50%  { transform: translate(var(--race-x-50, 50cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
75%  { transform: translate(var(--race-x-75, 75cqw), 0.18em); animation-timing-function: cubic-bezier(0.4, 0.2, 0.6, 0.8); }
100% { transform: translate(var(--race-end, 110cqw), 0.18em); }
}
@media (prefers-reduced-motion: no-preference) {
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
.retro--race-countdown.retro--gleis-right .retro-gleis,
.retro--race-active.retro--gleis-right .retro-gleis,
.retro--race-freeze.retro--gleis-right .retro-gleis {
opacity: 0;
}
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
.retro--race-freeze .retro-wheelchair {
animation-play-state: paused;
}
.retro--race-active .retro-wheelchair,
.retro--race-freeze .retro-wheelchair {
position: relative;
z-index: 4;
}
.retro--race-victory .retro-wheelchair {
opacity: 0;
}
}
.retro--race-victory .retro-line,
.retro--race-victory .retro-dest,
.retro--race-victory .retro-cd,
.retro--race-victory .retro-gleis {
opacity: 0;
}
.retro--race-victory.retro--flicker .retro-line {
animation: none;
}
.retro-ticker {
position: absolute;
inset: 0;
z-index: 16;
overflow: hidden;
display: flex;
align-items: center;
pointer-events: none;
background: var(--led-bg);
background-image: radial-gradient(
circle,
var(--led-substrate) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
border-radius: inherit;
container-type: inline-size;
}
.retro-ticker-text {
flex: none;
white-space: nowrap;
font-size: 1.9em;
line-height: 1;
color: var(--led-amber);
text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
text-transform: uppercase;
will-change: transform;
animation-name: retroTickerScroll;
animation-timing-function: linear;
animation-iteration-count: 1;
animation-fill-mode: both;
}
@keyframes retroTickerScroll {
from { transform: translateX(100cqw); }
to   { transform: translateX(-100%); }
}
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
.retro--size-small .retro-finish-line {
width: 10px;
background-size: 10px 10px;
}
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
container-type: size;
animation: retroVictoryAppear 0.22s ease-out both;
}
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
background-image: conic-gradient(
transparent 0deg 90deg,
var(--led-amber) 90deg 180deg,
transparent 180deg 270deg,
var(--led-amber) 270deg 360deg
);
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
.retro-victory-winner {
position: absolute;
top: 50%;
left: 50%;
z-index: 22;
width: 45cqmin;
height: 45cqmin;
min-width: 90px;
min-height: 90px;
max-width: 190px;
max-height: 190px;
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
.retro-winner-num {
position: absolute;
top: 44%;
left: 0;
right: 0;
transform: translateY(-50%);
text-align: center;
font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
font-weight: 900;
font-size: 20cqmin;
line-height: 1;
color: var(--led-substrate);
letter-spacing: -0.04em;
pointer-events: none;
}
.retro--size-small .retro-winner-trophy {
--mdc-icon-size: 51cqmin;
}
.retro--size-small .retro-winner-num {
font-size: 17cqmin;
top: 37%;
}
.retro--style-pixel .retro-victory-winner {
background-image: none;
}
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
transition: opacity 0.4s ease-out;
position: relative;
}
.retro-gleis::before {
content: '';
position: absolute;
top: 8%;
bottom: 8%;
left: 0;
width: 2px;
background-image: radial-gradient(
circle,
rgb(var(--led-glow-rgb) / 0.55) var(--led-dot-size),
transparent var(--led-dot-edge)
);
background-size: var(--led-dot-pitch) var(--led-dot-pitch);
pointer-events: none;
}
.retro--gleis-left .retro-gleis {
padding: 0 18px 0 14px;
margin-left: 0;
margin-right: 12px;
}
.retro--gleis-left .retro-gleis::before {
left: auto;
right: 0;
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
.retro-station-header {
display: flex;
align-items: center;
justify-content: space-between;
background: #000;
color: #fff;
padding: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
gap: var(--ha-space-2, 8px);
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
font-size: 1.1em;
letter-spacing: 0.02em;
}
.retro-station-header__side {
display: flex;
align-items: center;
gap: 5px;
min-width: 0;
flex: 1 1 0;
}
.retro-station-header__side--right {
justify-content: flex-end;
}
.retro-station-header__text {
min-width: 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
font-size: 1.2em;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}
.retro-station-header__tile {
display: inline-flex;
align-items: center;
justify-content: center;
background: #fff;
color: #000;
flex-shrink: 0;
width: 1.4em;
height: 1.4em;
padding: 0.12em;
box-sizing: border-box;
}
.retro-station-header__tile--mdi {
padding: 0.06em;
}
.retro-station-header__icon {
width: 100%;
height: 100%;
display: block;
fill: currentColor;
}
.retro-station-header__icon--flip-x {
transform: scaleX(-1);
}
.retro-station-header__mdi {
--mdc-icon-size: 1.28em;
display: inline-flex;
align-items: center;
justify-content: center;
color: inherit;
}
.retro-station-header__mdi--flip-x {
transform: scaleX(-1);
}
.retro-station-header__monogram {
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
font-size: 0.9em;
line-height: 1;
}
.retro-station-header__chip {
display: inline-flex;
align-items: center;
justify-content: center;
background: #fff;
color: #000;
flex-shrink: 0;
height: 1.4em;
padding: 0 0.4em;
box-sizing: border-box;
font-family: "WL Sans Condensed", "WL Sans", -apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
Arial, sans-serif;
font-weight: 700;
line-height: 1;
letter-spacing: 0;
white-space: nowrap;
}
.retro--size-medium .retro-station-header {
font-size: 0.9em;
padding: 6px var(--ha-space-2, 8px);
}
.retro--size-small .retro-station-header {
font-size: 0.8em;
padding: 5px var(--ha-space-2, 8px);
}
@container (inline-size < 320px) {
.retro-station-header__text {
display: none;
}
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
a:focus-visible,
button:focus-visible {
outline: 2px solid var(--led-amber, #ffa000);
outline-offset: 2px;
border-radius: 4px;
}
@keyframes retroRowReveal {
from {
opacity: 0;
transform: translateY(3px);
filter: brightness(0.4);
}
to {
opacity: 1;
transform: none;
filter: brightness(1);
}
}
.retro-row {
animation: retroRowReveal 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
animation-delay: calc(min(var(--row-i, 0), 6) * 80ms);
}
.retro-station-header__chip--clock {
gap: 0.25em;
}
.retro-station-header__chip-icon {
--mdc-icon-size: 1em;
display: inline-flex;
align-items: center;
color: inherit;
flex-shrink: 0;
}
.retro--line-stripe .retro-row {
padding-left: 10px;
}
.retro--line-stripe .retro-row::before {
content: '';
position: absolute;
top: 0;
bottom: 0;
left: 0;
width: 4px;
background: var(--retro-line-color, var(--led-amber));
filter: drop-shadow(0 0 4px var(--retro-line-color, rgb(var(--led-glow-rgb) / 0.45)));
pointer-events: none;
border-radius: 1px;
}
.retro--housing {
padding: 6px;
background: #111;
border-radius: 10px;
box-shadow:
inset 0 1px 0 rgba(255, 255, 255, 0.06),
0 2px 8px rgba(0, 0, 0, 0.5);
}
.retro--housing .retro-led {
border-radius: 6px;
}
.retro--housing .retro-led::before {
content: '';
position: absolute;
inset: 0;
background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%);
pointer-events: none;
z-index: 2;
border-radius: inherit;
}
.retro--housing .retro-station-header {
border-top-left-radius: 6px;
border-top-right-radius: 6px;
}
.retro--housing .retro-station:last-child,
.retro--housing .retro-station-header:last-child {
border-bottom-left-radius: 6px;
border-bottom-right-radius: 6px;
}
@media (prefers-reduced-motion: reduce) {
*,
*::before,
*::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
scroll-behavior: auto !important;
}
}`}};e([_e({attribute:!1})],si.prototype,"hass",void 0),e([fe()],si.prototype,"_config",void 0),e([fe()],si.prototype,"_versionMismatch",void 0),e([fe()],si.prototype,"_raceState",void 0),e([fe()],si.prototype,"_countdownDigit",void 0),e([fe()],si.prototype,"_raceWinner",void 0),e([fe()],si.prototype,"_tickerActive",void 0),e([fe()],si.prototype,"_viaPhase",void 0),si=e([he("wiener-linien-austria-retro-card")],si);export{si as WienerLinienAustriaRetroCard};
