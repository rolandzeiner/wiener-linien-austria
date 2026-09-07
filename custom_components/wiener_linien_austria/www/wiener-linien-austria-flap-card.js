// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,n){var a,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(a=e[o])&&(s=(r<3?a(s):r>3?a(t,i,s):a(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),a=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=a.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(t,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new r(i,e,n)},o=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:_}=Object,u=globalThis,f=u.trustedTypes,g=f?f.emptyScript:"",m=u.reactiveElementPolyfillSupport,b=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&c(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:a}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const r=n?.call(this);a?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=_(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(i)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of n){const n=document.createElement("style"),a=t.litNonce;void 0!==a&&n.setAttribute("nonce",a),n.textContent=i.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==a?this.removeAttribute(n):this.setAttribute(n,a),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),a="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=n;const r=a.fromAttribute(t,e.type);this[n]=r??this._$Ej?.get(n)??r,this._$Em=null}}requestUpdate(e,t,i,n=!1,a){if(void 0!==e){const r=this.constructor;if(!1===n&&(a=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??y)(a,t)||i.useDefault&&i.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:a},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==a||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,m?.({ReactiveElement:x}),(u.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,$=e=>e,S=k.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+E,C=`<${L}>`,T=document,R=()=>T.createComment(""),H=e=>null===e||"object"!=typeof e&&"function"!=typeof e,M=Array.isArray,D="[ \t\n\f\r]",W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,N=/>/g,P=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,j=/"/g,U=/^(?:script|style|textarea|title)$/i,F=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),I=F(1),K=F(2),q=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Z=new WeakMap,V=T.createTreeWalker(T,129);function Y(e,t){if(!M(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,n=[];let a,r=2===t?"<svg>":3===t?"<math>":"",s=W;for(let t=0;t<i;t++){const i=e[t];let o,l,c=-1,d=0;for(;d<i.length&&(s.lastIndex=d,l=s.exec(i),null!==l);)d=s.lastIndex,s===W?"!--"===l[1]?s=O:void 0!==l[1]?s=N:void 0!==l[2]?(U.test(l[2])&&(a=RegExp("</"+l[2],"g")),s=P):void 0!==l[3]&&(s=P):s===P?">"===l[0]?(s=a??W,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,o=l[1],s=void 0===l[3]?P:'"'===l[3]?j:B):s===j||s===B?s=P:s===O||s===N?s=W:(s=P,a=void 0);const h=s===P&&e[t+1].startsWith("/>")?" ":"";r+=s===W?i+C:c>=0?(n.push(o),i.slice(0,c)+z+i.slice(c)+E+h):i+E+(-2===c?t:h)}return[Y(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class J{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let a=0,r=0;const s=e.length-1,o=this.parts,[l,c]=Q(e,t);if(this.el=J.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=V.nextNode())&&o.length<s;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(z)){const t=c[r++],i=n.getAttribute(e).split(E),s=/([.?@])?(.*)/.exec(t);o.push({type:1,index:a,name:s[2],strings:i,ctor:"."===s[1]?ne:"?"===s[1]?ae:"@"===s[1]?re:ie}),n.removeAttribute(e)}else e.startsWith(E)&&(o.push({type:6,index:a}),n.removeAttribute(e));if(U.test(n.tagName)){const e=n.textContent.split(E),t=e.length-1;if(t>0){n.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],R()),V.nextNode(),o.push({type:2,index:++a});n.append(e[t],R())}}}else if(8===n.nodeType)if(n.data===L)o.push({type:2,index:a});else{let e=-1;for(;-1!==(e=n.data.indexOf(E,e+1));)o.push({type:7,index:a}),e+=E.length-1}a++}}static createElement(e,t){const i=T.createElement("template");return i.innerHTML=e,i}}function X(e,t,i=e,n){if(t===q)return t;let a=void 0!==n?i._$Co?.[n]:i._$Cl;const r=H(t)?void 0:t._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),void 0===r?a=void 0:(a=new r(e),a._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=a:i._$Cl=a),void 0!==a&&(t=X(e,a._$AS(e,t.values),a,n)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??T).importNode(t,!0);V.currentNode=n;let a=V.nextNode(),r=0,s=0,o=i[0];for(;void 0!==o;){if(r===o.index){let t;2===o.type?t=new te(a,a.nextSibling,this,e):1===o.type?t=new o.ctor(a,o.name,o.strings,this,e):6===o.type&&(t=new se(a,this,e)),this._$AV.push(t),o=i[++s]}r!==o?.index&&(a=V.nextNode(),r++)}return V.currentNode=T,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=X(this,e,t),H(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>M(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&H(this._$AH)?this._$AA.nextSibling.data=e:this.T(T.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new ee(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new J(e)),t}k(e){M(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const a of e)n===t.length?t.push(i=new te(this.O(R()),this.O(R()),this,this.options)):i=t[n],i._$AI(a),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,a){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,n){const a=this.strings;let r=!1;if(void 0===a)e=X(this,e,t,0),r=!H(e)||e!==this._$AH&&e!==q,r&&(this._$AH=e);else{const n=e;let s,o;for(e=a[0],s=0;s<a.length-1;s++)o=X(this,n[i+s],t,s),o===q&&(o=this._$AH[s]),r||=!H(o)||o!==this._$AH[s],o===G?e=G:e!==G&&(e+=(o??"")+a[s+1]),this._$AH[s]=o}r&&!n&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ne extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class ae extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class re extends ie{constructor(e,t,i,n,a){super(e,t,i,n,a),this.type=5}_$AI(e,t=this){if((e=X(this,e,t,0)??G)===q)return;const i=this._$AH,n=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,a=e!==G&&(i===G||n);n&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}}const oe=k.litHtmlPolyfillSupport;oe?.(J,te),(k.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let a=n._$litPart$;if(void 0===a){const e=i?.renderBefore??null;n._$litPart$=a=new te(t.insertBefore(R(),e),e,void 0,i??{})}return a._$AI(e),a})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:y},_e=(e=pe,t,i)=>{const{kind:n,metadata:a}=i;let r=globalThis.litPropertyMetadata.get(a);if(void 0===r&&globalThis.litPropertyMetadata.set(a,r=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const a=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,a,e,!0,i)},init(t){return void 0!==t&&this.C(n,void 0,e,t),t}}}if("setter"===n){const{name:n}=i;return function(i){const a=this[n];t.call(this,i),this.requestUpdate(n,a,e,!0,i)}}throw Error("Unsupported decorator location: "+n)};function ue(e){return(t,i)=>"object"==typeof i?_e(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return ue({...e,state:!0,attribute:!1})}const ge=1,me=3,be=4,we=e=>(...t)=>({_$litDirective$:e,values:t});let ye=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const ve=we(class extends ye{constructor(e){if(super(e),e.type!==ge||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const n=!!t[e];n===this.st.has(e)||this.nt?.has(e)||(n?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return q}}),xe={},ke=(e,t=xe)=>e._$AH=t,$e=we(class extends ye{constructor(){super(...arguments),this.key=G}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(ke(e),this.key=t),i}}),Se="important",Ae=" !"+Se,ze=we(class extends ye{constructor(e){if(super(e),e.type!==ge||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const n=e[i];return null==n?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const n=t[e];if(null!=n){this.ft.add(e);const t="string"==typeof n&&n.endsWith(Ae);e.includes("-")||t?i.setProperty(e,t?n.slice(0,-11):n,t?Se:""):i[e]=n}}return q}}),Ee="wl-austria-fonts";var Le={editor:{add_chip:"Chip hinzufügen",add_icon:"Symbol hinzufügen",date_format_placeholder:"d.m.Y",direction_label:"Fahrtrichtung",direction_not_served:"nicht bedient",direction_note_one_way:"Rückfahrt deaktiviert: {line} endet hier.",direction_unavailable:"Keine Abfahrten in dieser Richtung",header_amenities:"Symbole in diesem Slot",header_bar_aria:"Stationsanzeige — Seite wählen",header_chips_and_icons:"Textchips (max. {chips}) und Extra-Symbole (max. {icons})",header_left:"Linke Seite",header_pick_side_hint:"Seite antippen, dann unten füllen",header_right:"Rechte Seite",header_side_aria:"Seite der Stationsanzeige",header_slot_empty:"leer",line_active_aria:"Linie {line} aktiv",line_inactive_aria:"Linie {line} inaktiv",lines_empty_means_all:"leer = alle Linien",lines_label:"Linien an dieser Haltestelle",lines_selected:"{n} von {total}",no_lines_hint:"Wähle zuerst eine Haltestelle — die Linien kommen live aus der API.",no_lines_title:"Noch keine Linien verfügbar",per_line_direction_aria:"Linie {line}: {direction}",remove_chip_aria:"Chip {chip} entfernen",remove_icon_aria:"Symbol {icon} entfernen",remove_stop:"Haltestelle entfernen",section_board:"Fallblatt-Tafel",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Fußzeile",section_header:"Stationsanzeige",section_header_hint:"Direkt am Balken",section_led_panel:"LED-Anzeige",section_station:"Stationsband",section_walk_time:"Gehzeit zur Haltestelle",show_clock_short:"Uhr",show_date_short:"Datum",show_elevator_short:"Lift",show_escalator_short:"Rolltreppe",show_wc_short:"WC",size_medium:"Mittel",size_regular:"Standard",size_small:"Klein",tab_display:"Anzeige",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Stil",text_placeholder:"z. B. Name der nächsten Station",walk_time_aria:"Gehzeit in Minuten für Linie {line} Richtung {towards}",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_hint:"Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.",walk_time_less_aria:"Gehzeit für Linie {line} verringern",walk_time_more_aria:"Gehzeit für Linie {line} erhöhen",walk_time_placeholder:"–",walk_time_unit:"Minuten"}},Ce={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",stale_feed_detail:"Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.",stale_feed_since:"Letzte gemeldete Abfahrt: {time}",stale_feed_partial:"Einzelne Linien melden keine aktuellen Zeiten.",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie einen anderen Sensor oder entfernen Sie ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",cooling_title:"Klimatisiert",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",qr_dialog_close:"QR-Code schließen",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_colors_btn:"Linienfarben",devmode_clear_btn:"Löschen",editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Barrierefrei-Symbol anzeigen“.",colors_empty_hint:"Wähle im Reiter Stops Haltestellen aus — die Linien erscheinen dann hier.",colors_hint:"Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_requires:"Wirkt erst ab zwei Haltestellen.",layout_stacked:"Gestapelt",layout_tabs:"Reiter",max_departures:"Anzahl Abfahrten pro Haltestelle",pick_color_for_line:"Farbe für Linie {line} wählen",reset_color:"Auf Standard zurücksetzen",reset_color_aria:"Linienfarbe {line} auf Standard zurücksetzen",section_colors:"Linienfarben",section_colors_hint:"überschreibt API-Farbe",section_departure_row:"Abfahrtszeile",section_departure_row_hint:"pro Zeile",section_display:"Anzeige",section_disruptions:"Störungen & Verspätungen",section_layout:"Aufbau",section_layout_hint:"Struktur",show_accessibility:"Barrierefrei-Symbol anzeigen",show_cooling:"Klimaanlagen-Symbol anzeigen",show_cooling_helper:"Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.",show_delay:"Verspätungen anzeigen",show_delay_colors:"Verspätungen farblich hervorheben",show_delay_colors_helper:"Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.",show_delay_colors_requires:"Braucht „Verspätungen anzeigen“.",show_departures:"Abfahrtsliste anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_hero_metric:"Nächste Abfahrt groß anzeigen",show_platform:"Gleis/Steig anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",show_stops_ahead:"Zwischenstationen anzeigen",show_traffic_info:"Störungen anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen"}},Te={editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",flicker:"LED-Flackern simulieren",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",housing:"LED-Gehäuserahmen anzeigen",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",line_stripe:"Seitlichen Linienstreifen anzeigen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",message_text:"Nachricht",message_text_requires:"Braucht „Lauftext anzeigen“.",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",platform_side:"Gleis/Steig-Seite",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_left:"Immer links",platform_side_requires:"Braucht „Steig anzeigen“.",platform_side_right:"Immer rechts",section_display:"Anzeige",section_display_hint:"LED-Feld",section_header_hint:"Direkt am Balken",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als weiße Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als weiße Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_pill:"Linien-Plakette anzeigen",show_line_pill_helper:"Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.",show_platform:"Steig anzeigen",show_station_name:"Stationsnamen anzeigen",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",size:"Größe",station_bg:"Stationsschild-Hintergrund",station_bg_black:"Schwarz",station_bg_default:"Standard",station_bg_white:"Weiß",style:"Stil",style_classic:"Klassisch",style_pixel:"Punktmatrix",style_warm:"Warm",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",wheelchair_race:"Rollstuhl-Rennen (Easter Egg)"},aria_dismiss_message:"Lauftext schließen",aria_start_race:"Barrierefreiheits-Rennen starten",at_platform:"Einfahrt",barrier_free_title:"Barrierefrei zugänglich",betriebsschluss:"Betriebsschluss",countdown_minutes:"{n} Minuten",departures_list:"Kommende Abfahrten",dir_both:"Beide",dir_h:"Hinfahrt",dir_h_short:"H",dir_r:"Rückfahrt",dir_r_short:"R",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",gleis:"GLEIS",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",no_entity:"Keine Haltestelle ausgewählt",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",stale_feed:"Keine aktuellen Daten",steig:"STEIG",unit_min:"min",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",via_prefix:"ÜBER"},Re={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",col_line:"LINIE",col_dest:"RICHTUNG",col_step_free:"STUFENLOS",col_cd:"ANKUNFT",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",not_barrier_free_title:"Nicht barrierefrei",unit_min:"min",dir_both:"Beide",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Rollstuhl-Plakette anzeigen“.",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",entities:"Haltestellen",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.",housing:"Gehäuserahmen anzeigen",housing_helper:"Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.",section_display:"Anzeige",section_display_hint:"Fallblatt-Feld",section_station_helper:"Das farbige Band mit Stationsname und Uhrzeit am oberen Rand der Tafel.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als cremefarbene Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als cremefarbene Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_column:"Linienspalte anzeigen",show_line_column_helper:"Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",show_platform:"Gleis/Steig anzeigen",show_platform_helper:"Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.",show_station_name:"Stationsnamen anzeigen",show_station_name_helper:"Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.",size:"Größe",station_bg:"Hintergrund Stationsschild",station_bg_black:"Schwarz",station_bg_helper:"Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.",station_bg_line:"Erste Linie",station_bg_white:"Weiß",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",walk_time_no_data:"Keine passenden Abfahrten. Richtung wechseln oder warten, bis der Sensor Linien meldet."}},He={common:Le,modern:Ce,retro:Te,flap:Re},Me={editor:{add_chip:"Add chip",add_icon:"Add icon",date_format_placeholder:"d.m.Y",direction_label:"Direction",direction_not_served:"not served",direction_note_one_way:"Return direction disabled: {line} terminates here.",direction_unavailable:"No departures in this direction",header_amenities:"Icons in this slot",header_bar_aria:"Station sign — choose a side",header_chips_and_icons:"Text chips (max. {chips}) and extra icons (max. {icons})",header_left:"Left side",header_pick_side_hint:"Tap a side, then fill it in below",header_right:"Right side",header_side_aria:"Station sign side",header_slot_empty:"empty",line_active_aria:"Line {line} active",line_inactive_aria:"Line {line} inactive",lines_empty_means_all:"empty = all lines",lines_label:"Lines at this stop",lines_selected:"{n} of {total}",no_lines_hint:"Pick a stop first — lines arrive live from the API.",no_lines_title:"No lines yet",per_line_direction_aria:"Line {line}: {direction}",remove_chip_aria:"Remove chip {chip}",remove_icon_aria:"Remove icon {icon}",remove_stop:"Remove stop",section_board:"Split-flap board",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Footer",section_header:"Station sign",section_header_hint:"Edit on the bar",section_led_panel:"LED panel",section_station:"Station band",section_walk_time:"Walking time to the stop",show_clock_short:"Clock",show_date_short:"Date",show_elevator_short:"Lift",show_escalator_short:"Escalator",show_wc_short:"WC",size_medium:"Medium",size_regular:"Standard",size_small:"Small",tab_display:"Display",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Style",text_placeholder:"e.g. name of the next station",walk_time_aria:"Walking time in minutes for line {line} towards {towards}",walk_time_branching_hint:"Applies to every terminus in this direction",walk_time_hint:"Hides departures that would leave without you. Empty = no filter.",walk_time_less_aria:"Decrease walking time for line {line}",walk_time_more_aria:"Increase walking time for line {line}",walk_time_placeholder:"–",walk_time_unit:"minutes"}},De={no_data:"No departures available",betriebsschluss:"End of service",stale_feed:"No live data",stale_feed_detail:"Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.",stale_feed_since:"Last reported departure: {time}",stale_feed_partial:"Some lines aren't reporting current times.",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",cooling_title:"Air conditioned",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",qr_dialog_close:"Close QR code",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_colors_btn:"Line colours",devmode_clear_btn:"Clear",editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show accessibility icon”.",colors_empty_hint:"Pick stops on the Stops tab — their lines will show up here.",colors_hint:"Optional. Without an override the official line colour applies.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",layout:"Multi-stop layout",layout_requires:"Only takes effect with two or more stops.",layout_stacked:"Stacked",layout_tabs:"Tabs",max_departures:"Departures per stop",pick_color_for_line:"Pick colour for line {line}",reset_color:"Reset to default",reset_color_aria:"Reset line colour {line} to default",section_colors:"Line colours",section_colors_hint:"overrides the API colour",section_departure_row:"Departure row",section_departure_row_hint:"per row",section_display:"Display",section_disruptions:"Disruptions & delays",section_layout:"Structure",section_layout_hint:"Layout",show_accessibility:"Show step-free icon",show_cooling:"Show air-conditioning icon",show_cooling_helper:"Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.",show_delay:"Show delays",show_delay_colors:"Colour-code delays",show_delay_colors_helper:"Turns the countdown number red when a departure runs late and green when it runs early.",show_delay_colors_requires:"Requires “Show delays”.",show_departures:"Show departure list",show_elevator_info:"Show elevator outages",show_hero_metric:"Show next departure large",show_platform:"Show platform / track",show_qr_button:"Show QR-code button",show_stops_ahead:"Show intermediate stops",show_traffic_info:"Show disruption alerts",show_type_icon:"Show vehicle-type icon"}},We={editor:{accessibility_only:"Only show step-free departures",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",flicker:"Simulate LED flicker",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",housing:"Show LED cabinet frame",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",line_stripe:"Show line stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",message_text:"Message",message_text_requires:"Requires “Show ticker”.",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",platform_side:"Platform side",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_left:"Always left",platform_side_requires:"Requires “Show platform”.",platform_side_right:"Always right",section_display:"Display",section_display_hint:"LED panel",section_header_hint:"Edit on the bar",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a white chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a white chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_pill:"Show line badge",show_line_pill_helper:"Renders the line code as a filled badge in the line colour rather than plain text.",show_platform:"Show platform",show_station_name:"Show station name",show_unit:"Show the “min” unit",show_unit_helper:'Trail each countdown number with a small amber "min" caption.',size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_default:"Default",station_bg_white:"White",style:"Style",style_classic:"Classic",style_pixel:"Dot matrix",style_warm:"Warm",text:"Sign text",text_helper:"E.g. name of the next station.",wheelchair_race:"Wheelchair race (easter egg)"},aria_dismiss_message:"Dismiss scrolling message",aria_start_race:"Start accessibility race",at_platform:"Arriving",barrier_free_title:"Step-free access",betriebsschluss:"End of service",countdown_minutes:"{n} minutes",departures_list:"Upcoming departures",dir_both:"Both",dir_h:"Outbound",dir_h_short:"H",dir_r:"Return",dir_r_short:"R",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",gleis:"PLATF.",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",no_entity:"No stop selected",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",stale_feed:"No live data",steig:"BAY",unit_min:"min",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",version_update:"Retro card updated to v{v} — please reload",via_prefix:"VIA"},Oe={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",stale_feed:"No live data",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"BAY",col_line:"LINE",col_dest:"DIRECTION",col_step_free:"STEP-FREE",col_cd:"ARRIVAL",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",not_barrier_free_title:"Step-free access not available",unit_min:"min",dir_both:"Both",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show wheelchair badge”.",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",entities:"Stops",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.",housing:"Show cabinet frame",housing_helper:"Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.",section_display:"Display",section_display_hint:"Split-flap board",section_station_helper:"The coloured band with the station name + clock at the top of the board.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a cream chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a cream chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_column:"Show line column",show_line_column_helper:"Shows the column carrying the line code. Turn it off when the board only ever shows one line.",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",show_platform:"Show platform / track",show_platform_helper:"Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.",show_station_name:"Show station name",show_station_name_helper:"Coloured band with the station name and current time at the top of the card.",size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_helper:"Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.",station_bg_line:"First line",station_bg_white:"White",text:"Sign text",text_helper:"E.g. name of the next station.",walk_time_no_data:"No departures matched. Pick a direction or wait until the sensor reports lines."}},Ne={common:Me,modern:De,retro:We,flap:Oe};const Pe={de:Object.freeze({__proto__:null,common:Le,default:He,flap:Re,modern:Ce,retro:Te}),en:Object.freeze({__proto__:null,common:Me,default:Ne,flap:Oe,modern:De,retro:We})},Be=Pe.de??{};function je(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Ue(e,t,i){const n=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let a=je(e,Pe[n]??Be);if(void 0===a&&(a=je(e,Be)),void 0===a)return e;if(i)for(const[e,t]of Object.entries(i))a=a.replace(`{${e}}`,String(t));return a}function Fe(e,t,i="banner"){if(!e)return G;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return I`
      <div class=${i} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}const n=t("version_update").replace("{v}",e),a=t("version_reload");return I`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${n}</span>
      <button
        type="button"
        aria-label=${a}
        @click=${()=>function(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,"1")}catch{}window.location.reload()}(e)}
      >
        ${a}
      </button>
    </div>
  `}const Ie=s`
  :host {
    display: block;
  }

  /* ---------------------------------------------------------------- *
   * Shell: tab bar + scrolling column
   * ---------------------------------------------------------------- */

  .wl-editor {
    display: flex;
    flex-direction: column;
  }

  /* Sticky so the tabs stay reachable while a long Anzeige tab scrolls.
     z-index beats ha-form's own focused-field elevation. */
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
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 12px 14px 0;
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

  /* The underline is a child element rather than a border-bottom so it can
     bleed past the button's horizontal padding to the full tab width. */
  .wl-tab-underline {
    display: block;
    height: 2px;
    margin: 7px -14px -1px;
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

  /* ---------------------------------------------------------------- *
   * Section
   * ---------------------------------------------------------------- */

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

  /* ha-form sets its own vertical rhythm between fields; the section already
     supplies the outer padding, so strip the top gap it would add. */
  .wl-section-body ha-form {
    display: block;
  }

  /* ---------------------------------------------------------------- *
   * Bespoke rows (chips / direction / walk time / colour)
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Line chip — 34px tall for density, 44px hit area for WCAG 2.2 (2.5.8).
   * The ::before overlay is what buys both; do not replace it with padding.
   * ---------------------------------------------------------------- */

  .wl-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .wl-chip {
    --wl-chip-color: var(--primary-color);
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 10px;
    border-radius: 5px;
    border: 2px solid var(--wl-chip-color);
    background: transparent;
    color: var(--wl-chip-color);
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
    color: #fff;
  }

  .wl-chip:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 16%, transparent);
  }

  .wl-chip[aria-pressed="true"]:hover {
    background: color-mix(in srgb, var(--wl-chip-color) 88%, #000);
  }

  /* Offset outline rather than box-shadow: on a chip filled with its own line
     colour a shadow-based ring disappears into the fill. */
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

  /* ---------------------------------------------------------------- *
   * Read-only line badge
   * ---------------------------------------------------------------- */

  .wl-badge {
    flex: none;
    min-width: 34px;
    height: 24px;
    padding: 0 7px;
    box-sizing: border-box;
    border-radius: 5px;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 24px;
    text-align: center;
    forced-color-adjust: none;
  }

  /* ---------------------------------------------------------------- *
   * Direction buttons
   * ---------------------------------------------------------------- */

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

  /* Dashed rather than merely faded: the border style survives forced-colors
     mode, where opacity does not. */
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

  /* ---------------------------------------------------------------- *
   * Walk-time row
   * ---------------------------------------------------------------- */

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

  /* Stepper shell. The mockup specified −/value/+ only; the value stays a real
     text input so a 12-minute walk is one keystroke rather than twelve taps. */
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
    /* Native spinners duplicate the −/+ buttons and shrink the hit area. */
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

  /* ---------------------------------------------------------------- *
   * Colour override row
   * ---------------------------------------------------------------- */

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

  /* The real input is transparent and covers the field, so its own focus ring
     is invisible — lift the ring onto the field (WCAG 2.4.7). */
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

  /* ---------------------------------------------------------------- *
   * Stop block, empty state, add button
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Station header strip — direct manipulation.
   *
   * The bar mocks a physical black sign, so its surfaces are literal
   * colours rather than theme tokens: themed chrome here would stop the
   * widget looking like the thing it edits.
   * ---------------------------------------------------------------- */

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

  /* Right zone right-aligns its tokens so the preview matches how the card
     lays the two sides out against the centre of the strip. */
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

  /* ---------------------------------------------------------------- *
   * Segmented control — used by the side switch. Enum config fields use
   * ha-form's select instead; this exists for editor-local UI state that
   * never reaches the config.
   * ---------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------- *
   * Slot panel — the four fields for whichever side is selected.
   * ---------------------------------------------------------------- */

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
`,Ke=s`
  :host {
    --wl-sunken: color-mix(in srgb, var(--primary-text-color) 3%, var(--card-background-color));
    --wl-hover: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    --wl-ripple: color-mix(in srgb, var(--primary-color) 14%, transparent);
    /* The signage bar is a mock of a physical black sign, not themed chrome —
       these stay literal on purpose. Changing them to theme tokens would make
       the widget stop looking like the thing it is editing. */
    --wl-signage-housing: #0d0d0d;
    --wl-signage-selected: #171717;
    --wl-signage-outline: #3a3a3a;
    --wl-signage-chip: #2a2a2a;
    --wl-signage-ink: #f2f2f2;
  }
`;function qe(e,t,i){return I`
    <div class="wl-tabs" role="tablist">
      ${e.map((n,a)=>I`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${n.key}`}
          aria-selected=${t===n.key?"true":"false"}
          aria-controls=${`wl-panel-${n.key}`}
          tabindex=${t===n.key?"0":"-1"}
          @click=${()=>i(n.key)}
          @keydown=${t=>((t,n)=>{const a="ArrowRight"===t.key?1:"ArrowLeft"===t.key?-1:0;if(!a)return;t.preventDefault();const r=e[(n+a+e.length)%e.length];r&&i(r.key)})(t,a)}
        >
          ${n.label}
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function Ge(e,t){return I`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?I`<span class="wl-section-hint">${e.hint}</span>`:G}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function Ze(e){return Ge(e,I`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}const Ve={exit:{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"left",labelKey:"icon_exit",shapes:()=>K`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `},"exit-access":{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"right",labelKey:"icon_exit_access",shapes:()=>K`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `},wc:{kind:"text",text:"WC",labelKey:"icon_wc"},escalator:{kind:"svg",viewBox:"0 0 36.74 28.3",labelKey:"icon_escalator",shapes:()=>K`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `},elevator:{kind:"svg",viewBox:"0 0 24.01 36.69",labelKey:"icon_elevator",shapes:()=>K`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `}},Ye=["mdi:exit-run","mdi:exit-to-app","mdi:door-open","mdi:stairs"],Qe={"mdi:exit-run":{labelKey:"icon_mdi_exit_run",glyphPointsTo:"right"},"mdi:exit-to-app":{labelKey:"icon_mdi_exit_to_app",glyphPointsTo:"right"},"mdi:door-open":{labelKey:"icon_mdi_door_open"},"mdi:stairs":{labelKey:"icon_mdi_stairs"}};function Je(e,t){const i=Ve[e];if("text"===i.kind)return I`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${i.text}</span>
    </span>`;const n=t.flipX?"retro-station-header__icon retro-station-header__icon--flip-x":"retro-station-header__icon";return I`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
    <svg
      class=${n}
      viewBox=${i.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${i.shapes()}</svg>
  </span>`}function Xe(e){e.stopPropagation()}const et=[{key:"show_wc",icon:"mdi:human-male-female",labelKey:"show_wc_short"},{key:"show_escalator",icon:"mdi:escalator",labelKey:"show_escalator_short"},{key:"show_elevator",icon:"mdi:elevator",labelKey:"show_elevator_short"},{key:"show_clock",icon:"mdi:clock-outline",labelKey:"show_clock_short"},{key:"show_date",icon:"mdi:calendar",labelKey:"show_date_short"}],tt=[{value:"regular",icon:"mdi:exit-run",labelKey:"header_exit_regular"},{value:"accessible",icon:"mdi:wheelchair-accessibility",labelKey:"header_exit_accessible"},...Ye.map(e=>({value:e,icon:e,labelKey:Qe[e].labelKey})),{value:"none",icon:"mdi:close-circle-outline",labelKey:"header_exit_none"}];function it(e,t){const i=("header_left"===e.selected?e.left:e.right)??{},n=e.et("header_slot_empty"),a=(i,n)=>t.patch(e.selected,i,n);return I`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${e.et("header_bar_aria")}>
        ${nt("header_left",e,t,n)}
        ${nt("header_right",e,t,n)}
      </div>

      <div class="wl-strip-switch">
        <span class="wl-note wl-label--grow">${e.et("header_pick_side_hint")}</span>
        <div class="wl-seg" role="group" aria-label=${e.et("header_side_aria")}>
          ${["header_left","header_right"].map(i=>I`<button
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
            ${tt.map(t=>{const n=(i.exit??"none")===t.value,r=e.et(t.labelKey);return I`<button
                type="button"
                class="wl-pict"
                aria-pressed=${n?"true":"false"}
                aria-label=${r}
                title=${r}
                @click=${()=>a("exit",t.value)}
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
            maxlength="64"
            .value=${i.text??""}
            aria-label=${e.et("text")}
            placeholder=${e.et("text_placeholder")}
            @keydown=${Xe}
            @keyup=${Xe}
            @keypress=${Xe}
            @change=${e=>a("text",e.target.value.trim()||void 0)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et("header_amenities")}</span>
          <div class="wl-tray">
            ${et.map(t=>{const n=Boolean(i[t.key]),r=e.et(t.labelKey);return I`<button
                type="button"
                class="wl-tray-btn"
                aria-pressed=${n?"true":"false"}
                aria-label=${r}
                @click=${()=>a(t.key,!n)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
                ${r}
              </button>`})}
          </div>
          ${i.show_date?I`<input
                type="text"
                class="wl-text"
                maxlength="32"
                .value=${i.date_format??""}
                aria-label=${e.et("date_format")}
                placeholder=${e.et("date_format_placeholder")}
                @keydown=${Xe}
                @keyup=${Xe}
                @keypress=${Xe}
                @change=${e=>a("date_format",e.target.value.trim()||void 0)}
              />`:G}
        </div>

        ${function(e,t,i){const n=e.chips??[],a=e.extra_icons??[];return I`
    <div class="wl-group">
      <span class="wl-label"
        >${t.et("header_chips_and_icons").replace("{chips}",String(6)).replace("{icons}",String(3))}</span
      >
      <div class="wl-tray">
        ${a.map((e,n)=>I`<span class="wl-pill">
            <ha-icon icon=${e} aria-hidden="true"></ha-icon>
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et("remove_icon_aria").replace("{icon}",e)}
              @click=${()=>i("extra_icons",at(a,n))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
        ${n.map((e,a)=>I`<span class="wl-pill">
            ${e}
            <button
              type="button"
              class="wl-pill-x"
              aria-label=${t.et("remove_chip_aria").replace("{chip}",e)}
              @click=${()=>i("chips",at(n,a))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
      </div>

      ${a.length<3?I`<ha-icon-picker
            .value=${""}
            .label=${t.et("add_icon")}
            @value-changed=${e=>{const t=e.detail?.value;t&&i("extra_icons",[...a,t].slice(0,3))}}
          ></ha-icon-picker>`:G}
      ${n.length<6?I`<input
            type="text"
            class="wl-text"
            maxlength="16"
            aria-label=${t.et("add_chip")}
            placeholder=${t.et("add_chip")}
            @keydown=${e=>{if(e.stopPropagation(),"Enter"!==e.key)return;const t=e.target,a=t.value.trim();a&&(i("chips",[...n,a].slice(0,6)),t.value="")}}
            @keyup=${Xe}
            @keypress=${Xe}
          />`:G}
    </div>
  `}(i,e,a)}
      </div>
    </div>
  `}function nt(e,t,i,n){const a="header_left"===e?t.left:t.right,r=t.selected===e,s=function(e,t){const i=[];if(!e)return[{label:t,kind:"text"}];if(e.exit&&"none"!==e.exit){const t=tt.find(t=>t.value===e.exit);i.push({label:"",icon:t?.icon??e.exit,kind:"icon"})}e.text&&i.push({label:e.text,kind:"text"});for(const t of et)e[t.key]&&i.push({label:"",icon:t.icon,kind:"icon"});for(const t of e.extra_icons??[])i.push({label:"",icon:t,kind:"icon"});for(const t of e.chips??[])i.push({label:t,kind:"chip"});return i.length||i.push({label:t,kind:"text"}),i}(a,n);return I`<button
    type="button"
    class=${ve({"wl-zone":!0,"wl-zone--selected":r,"wl-zone--right":"header_right"===e})}
    aria-pressed=${r?"true":"false"}
    aria-label=${t.et("header_left"===e?"header_left":"header_right")}
    @click=${()=>i.selectSide(e)}
  >
    <span class="wl-zone-tokens">
      ${s.map(e=>I`<span
          class=${ve({"wl-token":!0,"wl-token--chip":"chip"===e.kind})}
          >${e.icon?I`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}</span
        >`)}
    </span>
  </button>`}function at(e,t){const i=e.filter((e,i)=>i!==t);return i.length?i:void 0}const rt=we(class extends ye{constructor(e){if(super(e),e.type!==me&&e.type!==ge&&e.type!==be)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===q||t===G)return t;const i=e.element,n=e.name;if(e.type===me){if(t===i[n])return q}else if(e.type===be){if(!!t===i.hasAttribute(n))return q}else if(e.type===ge&&i.getAttribute(n)===t+"")return q;return ke(e),t}}),st=new Set(["none","regular","accessible",...Ye]);function ot(e){if(!e||"object"!=typeof e)return;const t=e,i=st.has(t.exit)?t.exit:"none";let n;if("string"==typeof t.text){const e=t.text.trim().slice(0,64);e&&(n=e)}const a=!0===t.show_wc,r=!0===t.show_escalator,s=!0===t.show_elevator,o=!0===t.show_clock,l=!0===t.show_date;let c,d,h;if("string"==typeof t.date_format){const e=t.date_format.slice(0,32);e&&(c=e)}if(Array.isArray(t.chips)){const e=t.chips.filter(e=>"string"==typeof e).map(e=>e.trim().slice(0,16)).filter(e=>e.length>0).slice(0,6);e.length>0&&(d=e)}if(Array.isArray(t.extra_icons)){const e=t.extra_icons.filter(e=>"string"==typeof e).map(e=>e.trim()).filter(e=>e.startsWith("mdi:")&&e.length>=5&&e.length<=64).slice(0,3);e.length>0&&(h=e)}if(!("none"!==i||void 0!==n||a||r||s||o||l||void 0!==d||void 0!==h))return;const p={};return"none"!==i&&(p.exit=i),void 0!==n&&(p.text=n),a&&(p.show_wc=!0),r&&(p.show_escalator=!0),s&&(p.show_elevator=!0),o&&(p.show_clock=!0),l&&(p.show_date=!0),void 0!==c&&(p.date_format=c),void 0!==d&&(p.chips=d),void 0!==h&&(p.extra_icons=h),p}function lt(e,t,i={},n="var(--primary-color)"){const a=e.toUpperCase();if(void 0!==t[a])return{background:t[a]};if(/^N\d/.test(a))return{background:"#1b1464",color:"#fef200"};const r=i[e]??i[a];return r?.bg?r.fg?{background:`#${r.bg}`,color:`#${r.fg}`}:{background:`#${r.bg}`}:{background:n}}function ct(e,t){return`${e}|${t}`}function dt(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),n=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${n}`}function ht(e,t){const{lines:i,direction:n,line_directions:a,walk_times:r,accessibility_only:s}=t,o=i&&i.length?new Set(i):null;return e.filter(e=>{if(o&&!o.has(e.line))return!1;const t=a?.[e.line]??n;if(t&&e.direction!==t)return!1;if(r){const t=r[ct(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(s&&!e.barrier_free)})}const pt="ptMetro";const _t=120;function ut(e,t,i){const n=new Set;for(const a of e)a.direction===t&&(i&&a.line!==i||a.towards&&n.add(a.towards));return[...n].sort()}function ft(e,t){const i=new Set;for(const n of e)t&&n.line!==t||"H"!==n.direction&&"R"!==n.direction||i.add(n.direction);return i}function gt(e,t){return t.size>0?e.filter(e=>t.has(e)):e}function mt(e,t,i,n){const a=function(e,t){return e?.states?.[t]?.attributes}(e,t.entity),r=!a,s=a?.stop_name||t.entity,o=a?.line_colors??{},l=e=>function(e,t,i={},n="var(--primary-color)"){return lt(e,t,i,n).background}(e,i.lineColorOverrides,o,"#5b6470"),c=function(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}(a),d=new Set(t.lines??[]),h=function(e){const t=[],i=new Set;for(const n of e?.departures??[]){const e=String(n.direction??""),a=`${n.line}|${e}|${n.towards}`;i.has(a)||(i.add(a),t.push({line:n.line,direction:e,towards:n.towards,type:n.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(a),p=new Map;for(const e of a?.departures??[])e.line&&e.type&&!p.has(e.line)&&p.set(e.line,e.type);const _=e=>({full:i.t("H"===e?"dir_h":"dir_r"),short:i.t("H"===e?"dir_h_short":"dir_r_short")});return I`
    <section class="wl-section">
      <header class="wl-section-header">
        ${i.total>1?I`<span class="wl-index" aria-hidden="true">${i.index}</span>`:G}
        <span class="wl-section-title">${s}</span>
      </header>
      <div class="wl-stop-body">
        ${r?function(e,t,i){return I`
    <ha-alert alert-type="error">
      ${t.t("entity_missing").replace("{entity}",e.entity)}
      ${i.remove?I`<button
            type="button"
            slot="action"
            class="wl-add"
            @click=${()=>i.remove?.(e.entity)}
          >
            ${t.et("remove_stop")}
          </button>`:G}
    </ha-alert>
  `}(t,i,n):G}
        ${function(e,t,i,n){const{lines:a,picked:r,colorOf:s,typeByLine:o}=n,l=r.size?t.et("lines_selected").replace("{n}",String(r.size)).replace("{total}",String(a.length)):t.et("lines_empty_means_all");return I`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("lines_label")}</span>
        ${a.length?I`<span class="wl-note">${l}</span>`:G}
      </div>
      ${a.length?I`<div class="wl-chips">
            ${a.map(n=>{const a=t.singleLine?r.has(n):0===r.size||r.has(n),l=function(e){switch(e){case pt:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}(o.get(n));return I`<button
                type="button"
                class="wl-chip"
                style=${ze({"--wl-chip-color":s(n)})}
                aria-pressed=${a?"true":"false"}
                aria-label=${t.et(a?"line_active_aria":"line_inactive_aria").replace("{line}",n)}
                @click=${()=>i.toggleLine(e.entity,n)}
              >
                ${l?I`<span class="wl-chip-mode"
                      ><ha-icon icon=${l} aria-hidden="true"></ha-icon
                    ></span>`:G}
                ${n}
              </button>`})}
          </div>`:I`<div class="wl-empty">
            <span class="wl-empty-title">${t.et("no_lines_title")}</span>
            <span class="wl-note">${t.et("no_lines_hint")}</span>
          </div>`}
    </div>
  `}(t,i,n,{lines:c,picked:d,colorOf:l,typeByLine:p})}
        ${!r&&c.length?function(e,t){return!e.singleLine&&gt(t.lines,t.picked).length>=2}(i,{lines:c,picked:d})?function(e,t,i,n){const{triplets:a,picked:r,lines:s,colorOf:o,dirStrings:l}=n,c=gt(s,r),d=e.line_directions??{},h=e.direction??null,p=e=>d[e]??h,_=(t,n)=>{const a={};for(const e of c){const i=e===t?n:p(e);i&&(a[e]=i)}for(const[e,t]of Object.entries(d))c.includes(e)||(a[e]=t);i.setDirections(e.entity,{direction:null,lineDirections:a})};return I`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      ${c.map(e=>{const i=ft(a,e),n=p(e),r=i.has("H"),s=i.has("R"),c=1===i.size,d=i=>t.et("per_line_direction_aria").replace("{line}",e).replace("{direction}",null===i?t.t("dir_both"):dt(ut(a,i,e),l(i)));return I`
          <div class="wl-override-row">
            <span class="wl-badge" style=${ze({background:o(e)})}
              >${e}</span
            >
            <div class="wl-dirs">
              ${bt({label:l("H").short,active:"H"===n||null===n&&c&&r,disabled:!r,compact:!0,title:ut(a,"H",e).join(" / ")||t.t("dir_h"),ariaLabel:d("H"),onClick:()=>_(e,"H")})}
              ${bt({label:l("R").short,active:"R"===n||null===n&&c&&s,disabled:!s,compact:!0,title:ut(a,"R",e).join(" / ")||t.t("dir_r"),ariaLabel:d("R"),onClick:()=>_(e,"R")})}
              ${bt({label:"",icon:"mdi:swap-horizontal",active:null===n&&!c,disabled:c,compact:!0,title:t.t("dir_both"),ariaLabel:d(null),onClick:()=>_(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}(t,i,n,{triplets:h,picked:d,lines:c,colorOf:l,dirStrings:_}):function(e,t,i,n){const{triplets:a,picked:r,lines:s,dirStrings:o}=n,l=gt(s,r),c=1===l.length?l[0]:void 0,d=e.direction??null,h=ft(a,c),p=h.has("H"),_=h.has("R"),u=1===h.size,f="H"===d||null===d&&u&&p,g="R"===d||null===d&&u&&_,m=null===d&&!u,b=t=>{const n={};for(const[t,i]of Object.entries(e.line_directions??{}))l.includes(t)||(n[t]=i);i.setDirections(e.entity,{direction:t,lineDirections:n})},w=e=>0===h.size||h.has(e)?dt(ut(a,e,c),o(e)):`${o(e).short}: ${t.et("direction_not_served")}`,y=!_&&l.length?t.et("direction_note_one_way").replace("{line}",l[0]??""):"";return I`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      <div class="wl-dirs">
        ${bt({label:w("H"),active:f,disabled:!p,title:p?t.t("dir_h"):t.et("direction_unavailable"),onClick:()=>b("H")})}
        ${bt({label:w("R"),active:g,disabled:!_,title:_?t.t("dir_r"):t.et("direction_unavailable"),onClick:()=>b("R")})}
        ${t.singleLine?G:bt({label:t.t("dir_both"),active:m,disabled:u,title:u?t.et("direction_unavailable"):t.t("dir_both"),onClick:()=>b(null)})}
      </div>
      ${y?I`<span class="wl-note">${y}</span>`:G}
    </div>
  `}(t,i,n,{triplets:h,picked:d,lines:c,dirStrings:_}):G}
        ${r?G:function(e,t,i,n){const{attrs:a,picked:r,colorOf:s}=n,o=e.line_directions??{},l=e.direction??null,c=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),n=ct(i.line,e);let a=t.get(n);a||(a={line:i.line,direction:e,type:i.type,termini:[]},t.set(n,a)),i.towards&&!a.termini.includes(i.towards)&&a.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(a).filter(e=>{if(r.size>0&&!r.has(e.line))return!1;const t=o[e.line]??l;return!t||e.direction===t});return c.length?I`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("section_walk_time")}</span>
        <span class="wl-note">${t.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${t.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${c.map(n=>{const a=ct(n.line,n.direction),r=e.walk_times?.[a],o=n.termini.join(" / "),l=t.et("walk_time_aria").replace("{line}",n.line).replace("{towards}",o),c=t=>{const n=(r??0)+t;i.setWalkTime(e.entity,a,n<1?null:Math.min(_t,n))};return I`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${ze({background:s(n.line)})}
                >${n.line}</span
              >
              <span
                class="wl-walk-dest"
                title=${n.termini.length>1?t.et("walk_time_branching_hint"):o}
                >→ ${o}</span
              >
              <span class="wl-stepper">
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${void 0===r}
                  aria-label=${t.et("walk_time_less_aria").replace("{line}",n.line)}
                  @click=${()=>c(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${_t}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et("walk_time_placeholder")}
                  aria-label=${l}
                  .value=${rt(void 0!==r?String(r):"")}
                  @keydown=${Xe}
                  @keyup=${Xe}
                  @keypress=${Xe}
                  @change=${t=>i.setWalkTime(e.entity,a,function(e,t){const i=e.trim(),n=""===i?NaN:Number(i);return""===i||Number.isFinite(n)||console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(n)&&n>0?Math.min(120,Math.round(n)):null}(t.target.value,`${e.entity}/${a}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(r??0)>=_t}
                  aria-label=${t.et("walk_time_more_aria").replace("{line}",n.line)}
                  @click=${()=>c(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:G}(t,i,n,{attrs:a,picked:d,colorOf:l})}
      </div>
    </section>
  `}function bt(e){return I`<button
    type="button"
    class=${ve({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?"true":"false"}
    aria-disabled=${e.disabled?"true":"false"}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{e.disabled?t.preventDefault():e.onClick()}}
  >
    ${e.icon?I`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}
// Config normaliser for the Wiener Linien Austria flap card.
const wt=new Set(["small","medium","regular"]),yt=new Set(["line","white","black"]);function vt(e,t){return"boolean"==typeof e?e:t}function xt(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:null;if(!e||"object"!=typeof e)return null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return null;const n={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(n.lines=e)}"H"!==t.direction&&"R"!==t.direction||(n.direction=t.direction);const a=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,n]of Object.entries(e)){if("string"!=typeof i||!i.length)continue;const e=i.toUpperCase();"H"!==n&&"R"!==n?void 0!==n&&""!==n&&"Both"!==n&&console.warn(`[wiener-linien-austria] line_directions["${i}"] = ${JSON.stringify(n)} is not "H" / "R" / "Both" — dropping`):t[e]=n}return Object.keys(t).length?t:void 0}(t.line_directions);a&&(n.line_directions=a);const r=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,n]of Object.entries(e)){const e="number"==typeof n?n:"string"==typeof n?Number(n):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${i}"] = ${JSON.stringify(n)} is not a finite number in 0..120 — dropping`);continue}const a=i.split("|"),r=a.length>=3?`${a[0]}|${a[1]}`:i,s=Math.round(e),o=t[r];t[r]=void 0===o?s:Math.max(o,s)}return Object.keys(t).length?t:void 0}(t.walk_times);return r&&(n.walk_times=r),n}const kt=new Set(["type","entities","entity","line","lines","direction","walk_times","size","max_rows","show_platform","show_station_name","show_station_header","station_bg","show_min_unit","show_accessibility","accessibility_only","show_header","header_left","header_right","hide_attribution","show_line_column","housing"]);function $t(e){const t=wt.has(e.size)?e.size:"small",i=Number(e.max_rows),n=Number.isFinite(i);void 0===e.max_rows||n||console.warn(`[wiener-linien-austria-flap-card] max_rows ${JSON.stringify(e.max_rows)} is not a number — falling back to 2`);const a=n?Math.max(1,Math.min(8,Math.round(i))):2;let r=[];if(Array.isArray(e.entities))r=e.entities;else if("string"==typeof e.entity){let t;Array.isArray(e.lines)?t=e.lines.filter(e=>"string"==typeof e&&e.length>0):"string"==typeof e.line&&e.line&&(t=[e.line]),r=[{entity:e.entity,...t&&t.length?{lines:t}:{},...void 0!==e.direction?{direction:e.direction}:{},...void 0!==e.walk_times?{walk_times:e.walk_times}:{}}]}const s=[],o=new Set;for(const e of r){const t=xt(e);t?o.has(t.entity)||(o.add(t.entity),s.push(t)):console.warn("[wiener-linien-austria-flap-card] dropping malformed stop entry",e)}const l=function(e,t){const i={};if(!e||"object"!=typeof e)return i;for(const[n,a]of Object.entries(e))t.has(n)||(i[n]=a);return i}(e,kt),c=function(e){return"string"!=typeof e?"line":yt.has(e)||e.startsWith("line:")&&e.length>5?e:"line"}(e.station_bg),d=e.show_station_header,h="boolean"==typeof e.show_station_name?e.show_station_name:"boolean"!=typeof d||d;return{...l,type:e.type||"custom:wiener-linien-austria-flap-card",entities:s,size:t,max_rows:a,show_platform:vt(e.show_platform,!0),show_station_name:h,station_bg:c,show_min_unit:vt(e.show_min_unit,!0),show_accessibility:vt(e.show_accessibility,!0),accessibility_only:!0===e.accessibility_only,show_header:!0===e.show_header,header_left:ot(e.header_left),header_right:ot(e.header_right),hide_attribution:!0===e.hide_attribution,show_line_column:void 0!==e.show_line_column?!0===e.show_line_column:!0!==e.line_pill,housing:vt(e.housing,!0)}}
// Lovelace editor for the Wiener Linien Austria flap card (v2 editor system).
let St=class extends ce{constructor(){super(...arguments),this._tab="stops",this._headerSide="header_left",this._onEntitiesChanged=e=>{if(e.stopPropagation(),!this._config)return;const t=e.detail.value.entities,i=Array.isArray(t)?t.filter(e=>"string"==typeof e&&e.length>0):[],n=new Map(this._config.entities.map(e=>[e.entity,e]));this._commit({...this._config,entities:i.map(e=>n.get(e)??{entity:e})})},this._computeLabel=e=>{const t=this.hass?.localize?.(`ui.panel.lovelace.editor.card.generic.${e.name}`);return t||this._i18n.et(e.name)},this._computeHelper=e=>{const{et:t}=this._i18n;if("accessibility_only"===e.name&&!this._config?.show_accessibility)return t("accessibility_only_requires");const i=`${e.name}_helper`,n=t(i);return n===i?void 0:n}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-flap-card-editor: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-flap-card-editor: 'entity' must be a string");this._config=$t(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_tab")||e.has("_headerSide"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entities.map(e=>e.entity);return 0===i.length||i.some(e=>t.states[e]!==this.hass.states[e])}get _i18n(){return function(e,t){const i={hassLanguage:t};return{t:t=>Ue(`${e}.${t}`,i),et:t=>{const n=`${e}.editor.${t}`,a=Ue(n,i);if(a!==n)return a;const r=`common.editor.${t}`,s=Ue(r,i);return s===r?t:s}}}("flap",this.hass?.language)}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_patch(e){this._config&&this._commit($t({...this._config,...e}))}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._commit({...this._config,entities:i})}get _stopCallbacks(){return{toggleLine:(e,t)=>this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size?e.lines=[...i]:delete e.lines,e}),setDirections:(e,t)=>this._updateStop(e,e=>(null===t.direction?delete e.direction:e.direction=t.direction,Object.keys(t.lineDirections).length?e.line_directions=t.lineDirections:delete e.line_directions,e)),setWalkTime:(e,t,i)=>this._updateStop(e,e=>{const n={...e.walk_times??{}};return null===i?delete n[t]:n[t]=i,Object.keys(n).length?e.walk_times=n:delete e.walk_times,e}),remove:e=>{this._config&&this._commit({...this._config,entities:this._config.entities.filter(t=>t.entity!==e)})}}}render(){if(!this._config)return G;const{et:e}=this._i18n;return I`
      <div class="wl-editor">
        ${qe([{key:"stops",label:e("tab_stops")},{key:"display",label:e("tab_display")},{key:"tweaks",label:e("tab_tweaks")}],this._tab,e=>{this._tab=e})}
        ${t=this._tab,i=this._renderActiveTab(),I`
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
    `;var t,i}_renderActiveTab(){switch(this._tab){case"stops":return this._renderStops();case"display":return this._renderDisplay();case"tweaks":return this._renderTweaks()}}_renderStops(){const e=this._config,{t:t,et:i}=this._i18n;return I`
      <ha-form
        .hass=${this.hass}
        .data=${{entities:e.entities.map(e=>e.entity)}}
        .schema=${[{name:"entities",required:!0,selector:{entity:{multiple:!0,filter:{domain:"sensor",integration:"wiener_linien_austria"}}}}]}
        .computeLabel=${()=>i("entities")}
        .computeHelper=${()=>{}}
        @value-changed=${this._onEntitiesChanged}
      ></ha-form>
      ${e.entities.map((n,a)=>mt(this.hass,n,{index:a+1,total:e.entities.length,lineColorOverrides:{},t:t,et:i},this._stopCallbacks))}
    `}_renderDisplay(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return I`
      ${Ge({title:t("section_header"),hint:t("section_header_hint")},I`
          <ha-form
            .hass=${this.hass}
            .data=${{show_header:e.show_header}}
            .schema=${[{name:"show_header",selector:{boolean:{}}}]}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${e=>{e.stopPropagation(),this._patch(e.detail.value)}}
          ></ha-form>
          ${e.show_header?it({left:e.header_left,right:e.header_right,selected:this._headerSide,et:t},{selectSide:e=>{this._headerSide=e},patch:(e,t,i)=>this._patchHeaderSide(e,t,i)}):G}
        `)}
      ${Ze({...i,title:t("section_station"),data:{show_station_name:e.show_station_name,station_bg:e.station_bg},schema:[{name:"show_station_name",selector:{boolean:{}}},{name:"station_bg",selector:{select:{mode:"dropdown",options:this._stationBgOptions()}}}]})}
      ${Ze({...i,title:t("section_display"),hint:t("section_display_hint"),data:{max_rows:e.max_rows,show_platform:e.show_platform,show_accessibility:e.show_accessibility,accessibility_only:e.accessibility_only},schema:[{name:"max_rows",selector:{number:{min:1,max:8,step:1,mode:"slider"}}},{name:"show_platform",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",disabled:!e.show_accessibility,selector:{boolean:{}}}]})}
    `}_renderTweaks(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return I`
      ${Ze({...i,title:t("section_board"),data:{size:e.size,show_min_unit:e.show_min_unit,show_line_column:e.show_line_column,housing:e.housing},schema:[{name:"size",selector:{select:{mode:"dropdown",options:[{value:"small",label:t("size_small")},{value:"medium",label:t("size_medium")},{value:"regular",label:t("size_regular")}]}}},{name:"show_min_unit",selector:{boolean:{}}},{name:"show_line_column",selector:{boolean:{}}},{name:"housing",selector:{boolean:{}}}]})}
      ${Ze({...i,title:t("section_footer"),data:{hide_attribution:e.hide_attribution},schema:[{name:"hide_attribution",selector:{boolean:{}}}]})}
    `}_patchHeaderSide(e,t,i){if(!this._config)return;const n={...this._config[e]??{},[t]:i};void 0===i&&delete n[t],this._patch({[e]:n})}_stationBgOptions(){const{et:e}=this._i18n,t=[{value:"line",label:e("station_bg_line")}],i=new Set;for(const e of this._config?.entities??[]){const t=this.hass?.states?.[e.entity]?.attributes,n=e.lines&&e.lines.length>0?e.lines:t?.tracked_lines;for(const e of n??[])"string"==typeof e&&e&&i.add(e)}if(0===i.size){const e=this._config?.entities?.[0]?.entity,t=e?this.hass?.states?.[e]?.attributes?.line_colors:void 0;for(const e of Object.keys(t??{}))i.add(e)}for(const e of[...i].sort())t.push({value:`line:${e}`,label:e});return t.push({value:"white",label:e("station_bg_white")}),t.push({value:"black",label:e("station_bg_black")}),t}static{this.styles=[Ke,Ie]}};function At(e){if(!e)return[];const t=[];for(const[i,n]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=n?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}function zt(e){return String(e).padStart(2,"0")}function Et(e,t,i){if(!e||!t)return null;const n=Date.parse(e);return Number.isFinite(n)?function(e,t,i="de"){if(!t)return"";const n="en"===i?"en-GB":"de-AT",a=()=>e.toLocaleDateString(n,{weekday:"long"}),r=()=>e.toLocaleDateString(n,{weekday:"short"}),s=()=>e.toLocaleDateString(n,{month:"long"}),o=()=>e.toLocaleDateString(n,{month:"short"});let l="",c=0;for(;c<t.length;){const i=t[c];if("\\"===i&&c+1<t.length)l+=t[c+1],c+=2;else{switch(i){case"d":l+=zt(e.getDate());break;case"j":l+=String(e.getDate());break;case"D":l+=r();break;case"l":l+=a();break;case"m":l+=zt(e.getMonth()+1);break;case"n":l+=String(e.getMonth()+1);break;case"M":l+=o();break;case"F":l+=s();break;case"Y":l+=String(e.getFullYear());break;case"y":l+=zt(e.getFullYear()%100);break;case"H":l+=zt(e.getHours());break;case"G":l+=String(e.getHours());break;case"h":l+=zt((e.getHours()+11)%12+1);break;case"g":l+=String((e.getHours()+11)%12+1);break;case"i":l+=zt(e.getMinutes());break;case"s":l+=zt(e.getSeconds());break;default:l+=i??""}c++}}return l}(new Date(n),t,i):null}function Lt(e,t,i,n,a){let r=G;if("regular"===e.exit||"accessible"===e.exit){const i="regular"===e.exit?"exit":"exit-access";r=Je(i,{ariaLabel:n(`header.${Ve[i].labelKey}`),flipX:Ve[i].glyphPointsTo!==t})}else if(e.exit&&function(e){return"string"==typeof e&&e in Qe}(e.exit)){const i=Qe[e.exit];r=function(e,t){const i=t.flipX?"retro-station-header__mdi retro-station-header__mdi--flip-x":"retro-station-header__mdi";return I`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t.ariaLabel}>
    <ha-icon class=${i} icon=${e}></ha-icon>
  </span>`}(e.exit,{ariaLabel:n(`header.${i.labelKey}`),flipX:void 0!==i.glyphPointsTo&&i.glyphPointsTo!==t})}const s=e.text?I`<span class="retro-station-header__text">${e.text}</span>`:G,o=e=>Je(e,{ariaLabel:n(`header.${Ve[e].labelKey}`)}),l=e.show_wc?o("wc"):G,c=e.show_escalator?o("escalator"):G,d=e.show_elevator?o("elevator"):G,h=(e.extra_icons??[]).map(e=>I`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${e}>
    <ha-icon class="retro-station-header__mdi" icon=${e}></ha-icon>
  </span>`),p=[...h].reverse(),_=(e.chips??[]).map(e=>I`<span class="retro-station-header__chip">${e}</span>`),u=[..._].reverse(),f=e.show_clock?function(e){if(!e)return null;const t=Date.parse(e);if(!Number.isFinite(t))return null;const i=new Date(t);return`${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`}(i):null,g=f?I`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${f}</span>
      </span>`:G,m=e.show_date?Et(i,e.date_format??"d.m.Y",a):null,b=m?I`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${m}</span
      >`:G;return"left"===t?I`${r}${s}${d}${c}${l}${h}${_}${b}${g}`:I`${g}${b}${u}${p}${l}${c}${d}${s}${r}`}e([ue({attribute:!1})],St.prototype,"hass",void 0),e([fe()],St.prototype,"_config",void 0),e([fe()],St.prototype,"_tab",void 0),e([fe()],St.prototype,"_headerSide",void 0),St=e([he("wiener-linien-austria-flap-card-editor")],St);
// Wiener Linien Austria — Flap Card (Solari split-flap board).
const Ct="ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß",Tt="0123456789";function Rt(e,t,i){const n=((e.includes(t)?e.indexOf(t):e.length)+1)%(e.length+1);return n===e.length?i:e[n]}function Ht(e,t){if(e===t)return t;const i=Ct.includes(e),n=Tt.includes(e),a=Ct.includes(t),r=Tt.includes(t);return!i&&!a||n||r?!n&&!r||i||a?t:Rt(Tt,e,t):Rt(Ct,e,t)}function Mt(e,t){return`row${e}-${t}`}const Dt={small:22,medium:28,regular:32};function Wt(e){const t="number"==typeof e&&Number.isFinite(e)?e:null;return null===t?"--":String(t<=0?0:t).padStart(2," ")}{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-flap-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-flap-card",name:"Wiener Linien Austria — Flap Board",description:"Solari-style split-flap departure board",preview:!0,getEntitySuggestion:(e,t)=>t.startsWith("sensor.")?"wiener_linien_austria"!==e?.entities?.[t]?.platform?null:{config:{type:"custom:wiener-linien-austria-flap-card",entities:[t]}}:null})}let Ot=class extends ce{constructor(){super(...arguments),this._versionMismatch=null,this._displayed={},this._target={},this._justFlipped={},this._marchTimer=null,this._versionCheckDone=!1,this._fallbackWarned=!1}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-flap-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-flap-card: 'entity' must be a string");this._config=$t(e),this._clearFlipTimer(),this._displayed={},this._target={},this._justFlipped={}}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-flap-card-editor")}static getStubConfig(e){const t=At(e)[0];if(!t)return{};let i="H";const n=e?.states?.[t]?.attributes?.departures;if(Array.isArray(n)){const e=n.some(e=>"H"===e.direction),t=n.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(Ee))return;const e=document.createElement("style");e.id=Ee,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}disconnectedCallback(){super.disconnectedCallback(),this._clearFlipTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_displayed")||e.has("_target")||e.has("_justFlipped"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStopEids();return 0!==i.length&&i.some(e=>t.states[e]!==this.hass.states[e])}willUpdate(e){if(!this._config)return;if(!e.has("hass")&&!e.has("_config"))return;const t=this._gatherRows(),i=this._maxDestLen(t),n=this._maxLineLen(t);for(let e=0;e<t.length;e++){const a=t[e];a&&(this._diffFlipField(Mt(e,"line"),(a.line??"?").toUpperCase().padStart(n," ")),this._diffFlipField(Mt(e,"dest"),(a.towards??"").toUpperCase().padEnd(i," ")),this._diffFlipField(Mt(e,"cd"),Wt(a.countdown)))}for(let e=t.length;e<this._config.max_rows;e++)this._diffFlipField(Mt(e,"line"),null),this._diffFlipField(Mt(e,"dest"),null),this._diffFlipField(Mt(e,"cd"),null)}_clearFlipTimer(){null!==this._marchTimer&&(clearInterval(this._marchTimer),this._marchTimer=null)}_diffFlipField(e,t){if(null!==t){if(void 0===this._displayed[e])return this._displayed={...this._displayed,[e]:t},void(this._target={...this._target,[e]:t});this._target[e]!==t&&(this._target={...this._target,[e]:t},this._ensureMarchTimer())}else{if(e in this._displayed){const{[e]:t,...i}=this._displayed;this._displayed=i}if(e in this._target){const{[e]:t,...i}=this._target;this._target=i}if(e in this._justFlipped){const{[e]:t,...i}=this._justFlipped;this._justFlipped=i}}}_ensureMarchTimer(){null===this._marchTimer&&(this._marchTimer=setInterval(()=>this._marchTick(),130))}_marchTick(){const e={...this._displayed},t={};let i=!1;for(const[n,a]of Object.entries(this._target)){const r=e[n]??"";if(r===a)continue;const s=Math.max(r.length,a.length),o=[],l={};for(let e=0;e<s;e++){const t=r[e]??" ",i=a[e]??" ";t===i?o.push(t):(l[e]=t,o.push(Ht(t,i)))}const c=o.join("");e[n]=c,Object.keys(l).length>0&&(t[n]=l,i=!0)}this._displayed=e,this._justFlipped=t,i||this._clearFlipTimer()}async _checkCardVersion(){try{this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const n=await e.callWS({type:t});if(n?.version&&n.version!==i)return n.version}catch{}return null}(this.hass,"wiener_linien_austria/flap_card_version","2.0.0")}catch(e){console.warn("[wiener-linien-austria-flap-card] version probe failed",e)}}_resolveStopEids(){const e=this._config?.entities??[],t=this.hass?.states,i=e.map(e=>e.entity).filter(e=>t?.[e]);if(0===i.length&&0===e.length){const e=At(this.hass)[0];e&&i.push(e)}return 0===i.length&&e.length>0&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-flap-card] none of the configured entities exist in hass.states (${e.map(e=>e.entity).join(", ")})`)),i}_maxDestLen(e){return Math.max(0,...e.map(e=>(e.towards??"").length))}_maxLineLen(e){return Math.max(0,...e.map(e=>(e.line??"?").length))}_gatherRows(){if(!this._config)return[];const e=this._config.entities??[],t=this._config.accessibility_only,i=[];for(const n of e){const e=this.hass?.states?.[n.entity]?.attributes??{},a=ht(Array.isArray(e.departures)?e.departures:[],{direction:n.direction,lines:n.lines,line_directions:n.line_directions,walk_times:n.walk_times,accessibility_only:t});i.push(...a)}const n=e=>Number.isFinite(e.countdown)?e.countdown:Number.POSITIVE_INFINITY;return i.sort((e,t)=>n(e)-n(t)),i.slice(0,this._config.max_rows)}_t(e,t){return Ue(`flap.${e}`,{hassLanguage:this.hass?.language},t)}render(){if(!this._config)return G;const e=this._config,t=this._resolveStopEids(),i=this._gatherRows(),n=t[0]??"",a=n?this.hass?.states?.[n]?.attributes??{}:{},r=a.stop_name||a.friendly_name||"",s=a.line_colors??{},o=a.server_time,l=e.show_platform&&i.some(e=>e.platform),c=(i[0]?.type??"")===pt,d=this._t(c?"gleis":"steig"),h=!1===this.hass?.themes?.darkMode,p={flap:!0,[`flap--size-${e.size}`]:"regular"!==e.size,"flap--has-platform":l,"flap--light":h,"flap--no-line":!e.show_line_column,"flap--no-housing":!e.housing},_=this._resolveStationHeaderStyle(e.station_bg,e.entities,i,s),u=e.show_header?function(e){const{left:t,right:i,serverTime:n,t:a,lang:r}=e;return t||i?I`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${t?Lt(t,"left",n,a,r):G}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${i?Lt(i,"right",n,a,r):G}
      </div>
    </div>
  `:G}({left:e.header_left,right:e.header_right,serverTime:o,t:e=>this._t(e),lang:this.hass?.language}):G,f=e.hide_attribution?"":"string"==typeof a.attribution&&a.attribution||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return I`
      <ha-card style="padding:0;overflow:hidden;">
        <div class=${ve(p)}>
          ${Fe(this._versionMismatch,e=>this._t(e),"flap-banner")}
          ${u}
          ${e.show_station_name?I`<div
                class="flap-header"
                role="group"
                style=${ze(_)}
              >
                <div class="flap-header__station">${r}</div>
              </div>`:G}
          <div class="flap-panel">
            ${this._renderBoard(t,i,l,d,e.show_accessibility,!e.show_line_column,s)}
            ${f?I`<div class="flap-foot">${f}</div>`:G}
          </div>
        </div>
      </ha-card>
    `}_resolveStationHeaderStyle(e,t,i,n){if("white"===e)return{background:"#ffffff",color:"#1a1410"};if("black"===e)return{background:"#000000",color:"var(--flap-cream-hi)"};let a;if("line"===e?a=t[0]?.lines?.[0]??i[0]?.line:e.startsWith("line:")&&(a=e.slice(5)),!a)return{background:"var(--wl-orange)"};const r=lt(a,{},n);return{background:"var(--primary-color)"===r.background?"var(--wl-orange)":r.background,color:"var(--flap-on-color-fg)"}}_renderBoard(e,t,i,n,a,r,s){const o=this._maxDestLen(t),l=this._maxLineLen(t);if(0===e.length)return I`<div class="flap-empty">${this._t("no_entity")}</div>`;if(0===t.length){const t=e.some(e=>{const t=this.hass?.states?.[e]?.attributes??{};return Array.isArray(t.departures)&&t.departures.length>0}),i=e.some(e=>{const t=this.hass?.states?.[e]?.attributes??{};return"number"==typeof t.stale_departures&&t.stale_departures>0}),n=t?"no_data":i?"stale_feed":"betriebsschluss";return I`<div class="flap-empty">${this._t(n)}</div>`}const c=Dt[this._config?.size??"regular"],d=o*c+2*Math.max(0,o-1),h=a?d+6+c:d;return I`
      <div
        class=${ve({"flap-board":!0,"flap-board--has-platform":i,"flap-board--no-line":r})}
        role="list"
        aria-label=${this._t("departures_list")}
      >
        <div class="flap-colheader" aria-hidden="true">
          ${r?G:I`<span class="flap-colheader__line"
                >${this._t("col_line")}</span
              >`}
          <span
            class="flap-colheader__dest"
            style=${ze({maxWidth:`${h}px`})}
          >
            <span>${this._t("col_dest")}</span>
            ${a?I`<span class="flap-colheader__step-free"
                  >${this._t("col_step_free")}</span
                >`:G}
          </span>
          ${i?I`<span class="flap-colheader__platform"
                >${n}</span
              >`:G}
          <span class="flap-colheader__cd">${this._t("col_cd")}</span>
        </div>
        ${t.map((e,t)=>this._renderRow(e,t,s,i,r,o,l))}
      </div>
    `}_renderRow(e,t,i,n,a,r,s){const o=this._config,l=Number.isFinite(e.countdown)?e.countdown:null,c=null!==l&&l<=0,d=(e.line??"?").toUpperCase(),h=d.padStart(s," "),p=(e.towards??"").toUpperCase(),_=[d,p,null===l?this._t("no_data"):c?this._t("at_platform"):this._t("countdown_minutes",{n:String(l)})].filter(Boolean).join(" — "),u=lt(d,{},i),f="var(--primary-color)"!==u.background?{tileBg:u.background,blankSpace:!0}:{blankSpace:!0},g=this._renderFlipString(Wt(e.countdown),Mt(t,"cd"),{blankSpace:!0}),m=n?I`<div class="flap-cell flap-cell--platform" aria-hidden="true">
          ${e.platform?this._renderTile(e.platform,void 0,0,{wide:!0}):this._renderTile(" ",void 0,0,{wide:!0,blankSpace:!0})}
        </div>`:G;return I`
      <div class="flap-row" role="listitem" aria-label=${_}>
        ${a?G:I`<div class="flap-cell flap-cell--line" aria-hidden="true">
              ${this._renderFlipString(h,Mt(t,"line"),f)}
            </div>`}
        <div class="flap-cell flap-cell--dest" aria-hidden="true">
          ${this._renderFlipString(p.padEnd(r," "),Mt(t,"dest"),{blankSpace:!0})}
          ${o.show_accessibility?e.barrier_free?this._renderPictogramTile("mdi:wheelchair-accessibility",this._t("barrier_free_title")):this._renderAccessibilityBlankTile(this._t("not_barrier_free_title")):G}
        </div>
        ${m}
        <div class="flap-cell flap-cell--cd" aria-hidden="true">
          <span class="flap-cd-tiles">${g}</span>
          ${o.show_min_unit&&null!==l?I`<span class="flap-cd-unit">${this._t("unit_min")}</span>`:G}
        </div>
      </div>
    `}_renderFlipString(e,t,i={}){const n=(this._displayed[t]??e).split(""),a=this._justFlipped[t]??{};return I`<span class="flap-tiles" aria-label=${e}
      >${n.map((e,t)=>$e(`${t}:${e}`,this._renderTile(e,a[t],t,i)))}</span
    >`}_renderTile(e,t,i,n={}){if(" "===e&&!n.blankSpace)return I`<span class="flap-space" aria-hidden="true">&nbsp;</span>`;const a=" "===e,r=a?void 0:n.tileBg,s=a?void 0:n.tileFg,o=void 0!==t,l=ze({"--tile-i":String(i),...r?{"--tile-bg":r}:{},...s?{"--tile-fg":s}:{}}),c=ve({"flap-tile":!0,"flap-tile--wide":!0===n.wide,"flap-tile--color":void 0!==r,"flap-tile--flipping":o,"flap-tile--blank":a}),d=" "===e?"":e;return I`<span class=${c} style=${l}>
      <span class="flap-tile__half flap-tile__half--top"
        ><span class="flap-tile__glyph">${d}</span></span
      >
      <span class="flap-tile__half flap-tile__half--bottom"
        ><span class="flap-tile__glyph">${d}</span></span
      >
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
      ${o?I`<span class="flap-tile__leaf"
            ><span class="flap-tile__glyph">${" "===t?"":t}</span></span
          >`:G}
    </span>`}_renderPictogramTile(e,t){return I`<span
      class="flap-tile flap-tile--pictogram"
      aria-label=${t}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__pictogram-overlay">
        <ha-icon class="flap-tile__pictogram" .icon=${e}></ha-icon>
      </span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`}_renderAccessibilityBlankTile(e){return I`<span
      class="flap-tile flap-tile--a11y-blank"
      aria-label=${e}
    >
      <span class="flap-tile__half flap-tile__half--top"></span>
      <span class="flap-tile__half flap-tile__half--bottom"></span>
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`}static{this.styles=s`
    /* Register --tile-bg as a typed color so CSS can interpolate it
       inside the half / leaf gradients. Without this, transitioning
       a generic --tile-bg would swap as strings — no cross-fade. */
    @property --tile-bg {
      syntax: "<color>";
      inherits: true;
      initial-value: transparent;
    }
    :host {
      display: block;
      /* Stacking context for the housing shadow + tile drop-shadows
         so they only compete with each other, not the surrounding
         HA dashboard chrome. */
      isolation: isolate;
      /* Tells the browser this card supports both light and dark
         schemes so form controls / scrollbars match whichever
         palette the .flap--light class below selects. */
      color-scheme: light dark;
      /* Solari palette — exposed as custom properties so the
         .flap--light block below can flip the board theme in one
         place. Default values = dark mode. */
      --flap-housing: #1a1612;
      --flap-bg: #0d0b08;
      --flap-cream-hi: #f3eacd;
      --flap-cream: #e8ddbe;
      --flap-cream-lo: #cfc29c;
      --flap-ink: #1a1410;
      --flap-seam: rgba(0, 0, 0, 0.6);
      --flap-pin: rgba(0, 0, 0, 0.7);
      --wl-orange: #e97e00;
      /* International Symbol of Access blue (PMS 285 ≈ #0079c2).
         Used for wheelchair pictogram tiles so they read as the
         universally-recognised accessibility marker instead of
         blending into the cream voice of the rest of the board. */
      --flap-a11y: #0079c2;
      --flap-a11y-hi: #1c93d8;
      --flap-a11y-lo: #006099;
      /* Cross-theme semantic values. The board palette flips
         between light and dark modes, but these stay constant so
         saturated coloured surfaces (line tiles, ISA blue tile,
         WL orange band) keep their light glyph in both modes. */
      --flap-on-color-fg: #f3eacd;
      --flap-header-fg: #f3eacd;
      /* Quiet body text (empty state, ticker) — adapts via the
         .flap--light block below so it stays readable on whichever
         board surface is current. */
      --flap-quiet-fg: rgba(255, 255, 255, 0.85);
    }
    /* Light mode — driven by HA's theme (hass.themes.darkMode === false),
       not the OS/browser prefers-color-scheme. HA themes are
       deliberately decoupled from system appearance, so a user on
       a light HA theme inside a dark OS should still see the light
       board. The flag is wired via a class on the .flap element so
       CSS vars cascade to every descendant just like :host. Saturated
       coloured surfaces (WL orange band, line tiles, ISA-blue
       pictogram tile) keep their cream glyph via the --flap-*-fg
       vars which stay constant across both modes. */
    .flap--light {
      --flap-housing: #e0d5b5;
      --flap-bg: #f3eacd;
      --flap-cream-hi: #3a3a3a;
      --flap-cream: #2c2c2c;
      --flap-cream-lo: #1f1f1f;
      --flap-ink: #ffffff;
      --flap-seam: rgba(0, 0, 0, 0.7);
      --flap-pin: rgba(0, 0, 0, 0.85);
      --flap-quiet-fg: rgba(0, 0, 0, 0.6);
    }
    /* Drop the housing's inset bevel and softer drop shadow in
       light mode — the bevel is a depth cue tuned for dark-on-dark
       and reads as a hard black line on cream. Doubled selector
       (.flap.flap--light) bumps specificity above the bare .flap
       rule below so the override actually wins; .flap is declared
       later in source so equal specificity would lose to it. */
    .flap.flap--light {
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
    }
    .flap {
      background: var(--flap-housing);
      border-radius: 10px;
      padding: 6px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        inset 0 -1px 0 rgba(0, 0, 0, 0.6),
        0 6px 22px rgba(0, 0, 0, 0.45);
      font-family: "Barlow Condensed", "Saira Condensed", "WL Sans Condensed",
        "WL Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
      color: var(--flap-cream);
      box-sizing: border-box;
    }
    /* WL orange station header band — sits inside the housing, top
       corners rounded to match the housing's inner radius. Station
       name centred, clock right-aligned. Same Solari font for the
       clock so it ties typographically into the board below.
       This is NOT the retro card's station-header strip; it's the
       flap card's own header, intentionally just the orange band. */
    .flap-header {
      background: var(--wl-orange);
      color: var(--flap-header-fg);
      border-radius: 4px 4px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      height: 50px;
      font-family: "Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif;
      font-weight: 800;
      letter-spacing: 0.02em;
      box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.18);
    }
    .flap-header__station {
      text-align: center;
      font-size: 22px;
      letter-spacing: 0.04em;
    }
    /* CC-BY data-source credit — last child INSIDE the dark panel,
       so the panel surface extends all the way to the bottom of the
       cabinet (no cream/dark housing strip showing between rows and
       credit). Same quiet caption voice as the colheader captions
       and MIN unit; word-breaks gracefully on narrow boards. */
    .flap-foot {
      /* margin-top ≈ 1× line-height (14 px for an 11 px / 1.3 caption)
         — clear separator from the dense row above without dragging
         the credit into the rows' visual zone. */
      margin-top: 14px;
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-size: 11px;
      line-height: 1.3;
      letter-spacing: 0.02em;
      /* --flap-cream-lo (not --flap-quiet-fg) — matches the column
         captions and MIN unit voice so all small captions on the
         board read as one material. --flap-quiet-fg is white-ish in
         dark mode and would break the cream voice. */
      color: var(--flap-cream-lo);
      text-align: center;
      overflow-wrap: anywhere;
    }
    /* When the footer is present, keep the panel's bottom padding at
       12 px — slightly less than the top margin (14 px) for optical
       centring: small caps render top-heavy because their x-height
       pulls the visual centre below the geometric one, so symmetric
       padding would LOOK bottom-heavy. :has() keeps the rows-only
       layout (no footer rendered) at the default 12 px. */
    .flap-panel:has(.flap-foot) {
      padding-bottom: 12px;
    }
    /* housing off — drop the cabinet surround (bg, padding, bevel,
       drop shadow). The panel sits flush with the dashboard.
       .flap-header loses its rounded top corners with the surrounding
       padding gone, so we re-pin them here so the band still reads as
       a contained band rather than a bleeding rectangle. */
    .flap--no-housing.flap {
      background: transparent;
      padding: 0;
      box-shadow: none;
    }
    .flap--no-housing .flap-header {
      border-radius: 4px 4px 0 0;
    }
    .flap--no-housing > .flap-panel:first-of-type {
      border-radius: 4px;
    }
    .flap-panel {
      background: var(--flap-bg);
      border-radius: 0 0 4px 4px;
      padding: 10px 14px 12px;
      /* Faint top-down gradient (~3% white) suggests glass cover. */
      background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.025) 0%,
        rgba(255, 255, 255, 0) 30%
      );
    }
    /* When the header is hidden, the panel takes the full housing
       inner radius. */
    .flap > .flap-panel:first-of-type {
      border-radius: 4px;
    }
    /* Board layout — single CSS grid containing the optional column
       header + every row. The header and rows are subgrids that
       inherit the board's column tracks, so the "GLEIS" caption
       aligns to the platform column by construction (vs the
       pre-subgrid version where each row was its own grid and the
       auto-track widths drifted independently). */
    .flap-board {
      display: grid;
      grid-template-columns: auto 1fr auto;
      column-gap: 14px;
      row-gap: 6px;
      align-items: center;
    }
    .flap-board--has-platform {
      grid-template-columns: auto 1fr auto auto;
    }
    /* show_line_column off — the line
       cell + line colheader span are skipped in the template, so the
       grid loses its first auto track and shifts dest into column 1.
       Subgrids on .flap-colheader / .flap-row pick up the new track
       count automatically; no per-cell rules needed. */
    .flap-board--no-line {
      grid-template-columns: 1fr auto;
    }
    .flap-board--no-line.flap-board--has-platform {
      grid-template-columns: 1fr auto auto;
    }
    .flap-colheader {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
      align-items: end;
      padding-bottom: 2px;
      /* Match the .flap-cd-unit (MIN) label voice so the two
         column markers — GLEIS above the platform tile and MIN
         beside the countdown — read as one consistent caption
         system rather than two unrelated labels. */
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--flap-cream-lo);
    }
    .flap-colheader__platform {
      text-align: center;
    }
    .flap-colheader__line {
      text-align: start;
    }
    .flap-colheader__dest {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }
    .flap-colheader__step-free {
      /* Sits at the right edge of the dest column via the parent's
         space-between. The wheelchair pictogram lives inside
         .flap-cell--dest at varying x (its position depends on
         maxDestLen), so the caption can't be pixel-pinned to the
         pictogram; instead it labels the column as a whole, matching
         how GLEIS labels the platform column. */
      text-align: end;
    }
    .flap-colheader__cd {
      /* Mirrors .flap-cell--cd justify-content:flex-end so ANKUNFT
         lands above the right-packed countdown digits + MIN suffix. */
      text-align: end;
    }
    .flap-row {
      display: grid;
      grid-template-columns: subgrid;
      grid-column: 1 / -1;
      align-items: center;
      min-height: 44px;
    }
    .flap-cell--line {
      display: inline-flex;
    }
    .flap-cell--dest {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
    }
    .flap-cell--platform {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .flap-cell--cd {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      justify-content: flex-end;
    }
    .flap-cd-tiles {
      display: inline-flex;
      gap: 2px;
    }
    .flap-cd-unit {
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-weight: 600;
      font-size: 13px;
      color: var(--flap-cream-lo);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      align-self: end;
      padding-bottom: 6px;
    }
    .flap-tiles {
      display: inline-flex;
      gap: 2px;
    }
    .flap-space {
      display: inline-block;
      width: 0.45em;
    }

    /* ====================================================================
       Tile — the unit cell. Each character is its own perspective
       container so the leaf can rotate without coupling to neighbours.
       drop-shadow renders outside the layout box (overflow:visible on
       the tile keeps it unclipped) — that 1.5 px below the tile is
       what sells "card sits forward of the board".
       ==================================================================== */
    .flap-tile {
      position: relative;
      display: inline-block;
      width: 32px;
      height: 44px;
      perspective: 220px;
      overflow: visible;
      filter: drop-shadow(0 1.5px 0 rgba(0, 0, 0, 0.5));
      /* When opts.tileBg / opts.tileFg are set, --tile-bg / --tile-fg
         override the cream gradient on every face below. The
         transition cross-fades the line palette when a row's
         underlying departure swaps line — visible on shared-char
         positions (e.g. U1 to U3, both U in slot 0); flipping tiles
         re-mount fresh each tick via keyed() so they pick up the
         new colour instantly without a cross-fade. */
      transition: --tile-bg 320ms ease;
    }
    .flap-tile--wide {
      width: 38px;
    }
    .flap-tile__half {
      position: absolute;
      left: 0;
      right: 0;
      height: 50%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      color: var(--flap-ink);
      backface-visibility: hidden;
    }
    .flap-tile__half--top {
      top: 0;
      align-items: flex-start;
      background: linear-gradient(
        180deg,
        var(--flap-cream-hi) 0%,
        var(--flap-cream) 100%
      );
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
      border-radius: 2.5px 2.5px 0 0;
    }
    .flap-tile__half--bottom {
      bottom: 0;
      align-items: flex-end;
      background: linear-gradient(
        180deg,
        var(--flap-cream) 0%,
        var(--flap-cream-lo) 100%
      );
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.18);
      border-radius: 0 0 2.5px 2.5px;
    }
    /* Glyph spans the FULL tile height (44 px) inside a half-height
       container — overflow:hidden + align-items clips it to the top
       or bottom half. flex-start on top reveals the top half of the
       glyph; flex-end on bottom reveals the bottom. */
    .flap-tile__glyph {
      display: block;
      height: 44px;
      font-size: 30px;
      line-height: 44px;
      font-weight: 700;
      font-feature-settings: "tnum" 1;
    }
    .flap-tile--wide .flap-tile__glyph {
      font-size: 32px;
    }
    /* Seam — 1 px dark line + 1 px highlight below. THIS is the
       detail that sells the mechanical look. It must visibly cut
       through the glyph; no fade, no gradient — sharp + crisp. */
    .flap-tile__seam {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(50% - 0.5px);
      height: 1px;
      background: var(--flap-seam);
      z-index: 2;
      pointer-events: none;
    }
    .flap-tile__seam::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 1px;
      height: 1px;
      background: rgba(255, 255, 255, 0.18);
    }
    /* Hinge pins — 3 × 3 px dark dots at the seam's left + right
       edges. The detail that pushes the look from "plausible" to
       "physical". Skip these and the tile reads as a digital
       simulation. */
    .flap-tile__pin {
      position: absolute;
      top: calc(50% - 1.5px);
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--flap-pin);
      z-index: 3;
      pointer-events: none;
    }
    .flap-tile__pin--l {
      left: -1px;
    }
    .flap-tile__pin--r {
      right: -1px;
    }
    /* Coloured tile (line code) — inherits the same seam + pins +
       glyph alignment as a cream tile; only the face gradient swaps.
       --tile-bg / --tile-fg come from styleMap on the rendered tile. */
    .flap-tile--color .flap-tile__half--top {
      background: linear-gradient(
        180deg,
        color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
        var(--tile-bg, #888) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    .flap-tile--color .flap-tile__half--bottom {
      background: linear-gradient(
        180deg,
        var(--tile-bg, #888) 0%,
        color-mix(in oklab, var(--tile-bg, #888) 84%, black 16%) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    .flap-tile--color .flap-tile__seam {
      background: rgba(0, 0, 0, 0.4);
    }
    .flap-tile--color .flap-tile__seam::after {
      background: rgba(255, 255, 255, 0.22);
    }
    /* Pictogram tile — same flap geometry as a glyph tile but the
       cream halves swap to the International Symbol of Access blue
       and the ha-icon overlay paints in white. The seam still draws
       at z-index 2 so the mechanical hinge visibly cuts through
       the pictogram, matching the design spec ("vertically centred
       so the seam crosses it"). */
    .flap-tile--pictogram .flap-tile__half--top {
      background: linear-gradient(
        180deg,
        var(--flap-a11y-hi) 0%,
        var(--flap-a11y) 100%
      );
    }
    .flap-tile--pictogram .flap-tile__half--bottom {
      background: linear-gradient(
        180deg,
        var(--flap-a11y) 0%,
        var(--flap-a11y-lo) 100%
      );
    }
    /* Darker seam + slightly brighter highlight on the blue face —
       the cream-palette seam vanishes against the saturated blue. */
    .flap-tile--pictogram .flap-tile__seam {
      background: rgba(0, 0, 0, 0.45);
    }
    .flap-tile--pictogram .flap-tile__seam::after {
      background: rgba(255, 255, 255, 0.28);
    }
    .flap-tile__pictogram-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      color: var(--flap-on-color-fg);
      pointer-events: none;
    }
    .flap-tile__pictogram {
      --mdc-icon-size: 26px;
      color: var(--flap-on-color-fg);
    }
    .flap--size-medium .flap-tile__pictogram {
      --mdc-icon-size: 22px;
    }
    .flap--size-small .flap-tile__pictogram {
      --mdc-icon-size: 18px;
    }
    /* Leaf — the OLD top half hinged at the seam, rotating 0 → -90°
       to reveal the static-top NEW glyph underneath. Single leaf
       (real Solari boards only have ONE flapping card visible at a
       time — the static bottom is already the new value, only the
       top needs to flap away). */
    .flap-tile__leaf {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 50%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background: linear-gradient(
        180deg,
        var(--flap-cream-hi) 0%,
        var(--flap-cream) 100%
      );
      color: var(--flap-ink);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.45),
        0 1px 2px rgba(0, 0, 0, 0.35);
      border-radius: 2.5px 2.5px 1px 1px;
      z-index: 4;
      backface-visibility: hidden;
      transform-origin: bottom center;
      transform: rotateX(0deg);
    }
    .flap-tile--color .flap-tile__leaf {
      background: linear-gradient(
        180deg,
        color-mix(in oklab, var(--tile-bg, #888) 78%, white 22%) 0%,
        var(--tile-bg, #888) 100%
      );
      color: var(--tile-fg, var(--flap-on-color-fg));
    }
    /* One leaf rotation 0° → -90° per march tick. keyed() re-mounts
       the tile each tick so the animation restarts from 0° instead
       of jumping mid-rotation. */
    .flap-tile--flipping .flap-tile__leaf {
      animation: flapLeaf 130ms cubic-bezier(0.4, 0, 0.7, 1) forwards;
    }
    @keyframes flapLeaf {
      to {
        transform: rotateX(-90deg);
      }
    }

    /* Empty state — body cream so the board stays one cohesive
       cream-on-dark material when no departures are flowing. */
    .flap-empty {
      text-align: center;
      padding: 24px 0;
      font-family: "Barlow Condensed", "WL Sans Condensed", sans-serif;
      font-weight: 600;
      font-size: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--flap-cream);
    }

    /* Size variants — shrink the tile + glyph proportionally. The
       seam + pins stay at their pixel scale (the mechanical details
       look wrong if they scale linearly with the tile). */
    .flap--size-medium .flap-tile {
      width: 28px;
      height: 38px;
    }
    .flap--size-medium .flap-tile--wide {
      width: 34px;
    }
    .flap--size-medium .flap-tile__glyph {
      height: 38px;
      font-size: 26px;
      line-height: 38px;
    }
    .flap--size-medium .flap-row {
      min-height: 38px;
    }
    .flap--size-small .flap-tile {
      width: 22px;
      height: 30px;
    }
    .flap--size-small .flap-tile--wide {
      width: 28px;
    }
    .flap--size-small .flap-tile__glyph {
      height: 30px;
      font-size: 20px;
      line-height: 30px;
    }
    .flap--size-small .flap-row {
      min-height: 30px;
    }

    /* Banner (version-mismatch handshake) — quieter cream-on-housing
       than the LED card's amber banner, so it doesn't shout against
       the warm palette. */
    .flap-banner {
      background: #ffa000;
      color: #1a1410;
      padding: 6px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: "Work Sans", sans-serif;
      border-radius: 4px;
      font-size: 12px;
    }
    .flap-banner button {
      background: #1a1410;
      color: #ffa000;
      border: none;
      border-radius: 3px;
      padding: 3px 10px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    /* Accessibility — visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--flap-cream-hi);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* ====================================================================
       Station-header strip (signage homage above the WL-orange band).
       Reuses the retro card's helpers from utils/retro-station-icons.ts
       — same .retro-station-header__* classes emitted by those
       helpers — but recoloured for the flap card's warm-cream palette
       so chips + amenity tiles read as flap-pocket material rather
       than as bright-white signage chips. Each card's static-styles
       block is shadow-DOM scoped, so the two cards' CSS for the same
       class names live in independent worlds.
       ==================================================================== */
    .retro-station-header {
      /* Pin the signage strip to dark-palette values so it stays
         visually consistent across HA's light/dark themes. The
         strip is part of the card's branded chrome (like the WL
         orange band below) — it shouldn't recolour with the user's
         dashboard theme. Re-declaring the three flap vars locally
         scopes the override to this block and its descendants. */
      --flap-housing: #1a1612;
      --flap-cream-hi: #f3eacd;
      --flap-ink: #1a1410;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--flap-housing);
      color: var(--flap-cream-hi);
      padding: 6px 10px;
      gap: 8px;
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 1.1em;
      letter-spacing: 0.02em;
      border-radius: 4px 4px 0 0;
      box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.6);
    }
    /* When the WL-orange .flap-header is also rendered below the
       signage strip, drop the strip's bottom corners to seam cleanly
       into the orange band. */
    .retro-station-header + .flap-header {
      border-radius: 0;
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
      color: var(--flap-cream-hi);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    /* Tile (exit / amenity icons) — recoloured from white-on-black
       to cream-on-dark so the tiles read as flap-pocket material.
       The cream chosen (var(--flap-cream-hi)) is the SAME warm
       gradient top stop the flap tiles use; the icons inside
       inherit dark ink via color: var(--flap-ink). */
    .retro-station-header__tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--flap-cream-hi);
      color: var(--flap-ink);
      flex-shrink: 0;
      width: 1.4em;
      height: 1.4em;
      padding: 0.12em;
      box-sizing: border-box;
      border-radius: 2px;
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
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 0.9em;
      line-height: 1;
    }
    /* Chip — same cream pocket as the tile, dynamic width for short
       text labels. Matches the flap tiles' warm-cream voice so the
       strip reads as one cohesive material with the board below. */
    .retro-station-header__chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--flap-cream-hi);
      color: var(--flap-ink);
      flex-shrink: 0;
      height: 1.4em;
      padding: 0 0.4em;
      box-sizing: border-box;
      border-radius: 2px;
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
        BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .retro-station-header__chip--clock {
      gap: 0.25em;
      font-variant-numeric: tabular-nums;
    }
    .retro-station-header__chip--date {
      font-variant-numeric: tabular-nums;
    }
    .retro-station-header__chip-icon {
      --mdc-icon-size: 1em;
      display: inline-flex;
      align-items: center;
      color: inherit;
      flex-shrink: 0;
    }
    /* Size-token alignment — match the .flap--size-* scale. */
    .flap--size-medium .retro-station-header {
      font-size: 1em;
      padding: 5px 10px;
    }
    .flap--size-small .retro-station-header {
      font-size: 0.9em;
      padding: 4px 8px;
    }
    /* Narrow-width reflow — drop the destination label so the
       icons stay visible at narrow widths. Container query matches
       the nearest inline-size container. */
    @container (inline-size < 360px) {
      .retro-station-header__text {
        display: none;
      }
    }

    /* prefers-reduced-motion — Solari is showy and continuous. Drop
       the rotation, swap to a 60 ms crossfade. Static bottom still
       carries the value; user sees a smooth swap rather than an
       abrupt snap. */
    @media (prefers-reduced-motion: reduce) {
      .flap-tile {
        /* Skip the --tile-bg cross-fade for motion-sensitive users —
           colour changes snap instantly instead. */
        transition: none;
      }
      .flap-tile--flipping .flap-tile__leaf {
        animation: flapLeafFade 60ms ease-out forwards;
        animation-delay: 0ms;
      }
      @keyframes flapLeafFade {
        to {
          opacity: 0;
        }
      }
    }
  `}};e([ue({attribute:!1})],Ot.prototype,"hass",void 0),e([fe()],Ot.prototype,"_config",void 0),e([fe()],Ot.prototype,"_versionMismatch",void 0),e([fe()],Ot.prototype,"_displayed",void 0),e([fe()],Ot.prototype,"_target",void 0),e([fe()],Ot.prototype,"_justFlipped",void 0),Ot=e([he("wiener-linien-austria-flap-card")],Ot);export{Ot as WienerLinienAustriaFlapCard};
