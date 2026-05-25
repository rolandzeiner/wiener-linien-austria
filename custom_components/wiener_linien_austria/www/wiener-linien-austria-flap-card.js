// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,n){var s,r=arguments.length,a=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,n);else for(var o=e.length-1;o>=0;o--)(s=e[o])&&(a=(r<3?s(a):r>3?s(t,i,a):s(t,i))||a);return r>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),s=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=s.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new r(i,e,n)},o=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:l,defineProperty:h,getOwnPropertyDescriptor:d,getOwnPropertyNames:c,getOwnPropertySymbols:p,getPrototypeOf:_}=Object,f=globalThis,u=f.trustedTypes,m=u?u.emptyScript:"",g=f.reactiveElementPolyfillSupport,b=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&h(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:s}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const r=n?.call(this);s?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=_(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...c(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(i)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of n){const n=document.createElement("style"),s=t.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=i.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=n;const r=s.fromAttribute(t,e.type);this[n]=r??this._$Ej?.get(n)??r,this._$Em=null}}requestUpdate(e,t,i,n=!1,s){if(void 0!==e){const r=this.constructor;if(!1===n&&(s=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??y)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:s},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==s||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,g?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,$=e=>e,S=k.trustedTypes,A=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+E,C=`<${R}>`,L=document,H=()=>L.createComment(""),M=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,P="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,O=/>/g,F=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,U=/"/g,B=/^(?:script|style|textarea|title)$/i,j=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),G=new WeakMap,q=L.createTreeWalker(L,129);function V(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,n=[];let s,r=2===t?"<svg>":3===t?"<math>":"",a=N;for(let t=0;t<i;t++){const i=e[t];let o,l,h=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===N?"!--"===l[1]?a=D:void 0!==l[1]?a=O:void 0!==l[2]?(B.test(l[2])&&(s=RegExp("</"+l[2],"g")),a=F):void 0!==l[3]&&(a=F):a===F?">"===l[0]?(a=s??N,h=-1):void 0===l[1]?h=-2:(h=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?F:'"'===l[3]?U:W):a===U||a===W?a=F:a===D||a===O?a=N:(a=F,s=void 0);const c=a===F&&e[t+1].startsWith("/>")?" ":"";r+=a===N?i+C:h>=0?(n.push(o),i.slice(0,h)+z+i.slice(h)+E+c):i+E+(-2===h?t:c)}return[V(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class Q{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let s=0,r=0;const a=e.length-1,o=this.parts,[l,h]=Z(e,t);if(this.el=Q.createElement(l,i),q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=q.nextNode())&&o.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(z)){const t=h[r++],i=n.getAttribute(e).split(E),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:s,name:a[2],strings:i,ctor:"."===a[1]?te:"?"===a[1]?ie:"@"===a[1]?ne:ee}),n.removeAttribute(e)}else e.startsWith(E)&&(o.push({type:6,index:s}),n.removeAttribute(e));if(B.test(n.tagName)){const e=n.textContent.split(E),t=e.length-1;if(t>0){n.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],H()),q.nextNode(),o.push({type:2,index:++s});n.append(e[t],H())}}}else if(8===n.nodeType)if(n.data===R)o.push({type:2,index:s});else{let e=-1;for(;-1!==(e=n.data.indexOf(E,e+1));)o.push({type:7,index:s}),e+=E.length-1}s++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function Y(e,t,i=e,n){if(t===I)return t;let s=void 0!==n?i._$Co?.[n]:i._$Cl;const r=M(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(e),s._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=s:i._$Cl=s),void 0!==s&&(t=Y(e,s._$AS(e,t.values),s,n)),t}class J{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??L).importNode(t,!0);q.currentNode=n;let s=q.nextNode(),r=0,a=0,o=i[0];for(;void 0!==o;){if(r===o.index){let t;2===o.type?t=new X(s,s.nextSibling,this,e):1===o.type?t=new o.ctor(s,o.name,o.strings,this,e):6===o.type&&(t=new se(s,this,e)),this._$AV.push(t),o=i[++a]}r!==o?.index&&(s=q.nextNode(),r++)}return q.currentNode=L,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),M(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>T(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new J(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new Q(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const s of e)n===t.length?t.push(i=new X(this.O(H()),this.O(H()),this,this.options)):i=t[n],i._$AI(s),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,s){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,n){const s=this.strings;let r=!1;if(void 0===s)e=Y(this,e,t,0),r=!M(e)||e!==this._$AH&&e!==I,r&&(this._$AH=e);else{const n=e;let a,o;for(e=s[0],a=0;a<s.length-1;a++)o=Y(this,n[i+a],t,a),o===I&&(o=this._$AH[a]),r||=!M(o)||o!==this._$AH[a],o===K?e=K:e!==K&&(e+=(o??"")+s[a+1]),this._$AH[a]=o}r&&!n&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class ne extends ee{constructor(e,t,i,n,s){super(e,t,i,n,s),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??K)===I)return;const i=this._$AH,n=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==K&&(i===K||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const re=k.litHtmlPolyfillSupport;re?.(Q,X),(k.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;let oe=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let s=n._$litPart$;if(void 0===s){const e=i?.renderBefore??null;n._$litPart$=s=new X(t.insertBefore(H(),e),e,void 0,i??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};oe._$litElement$=!0,oe.finalized=!0,ae.litElementHydrateSupport?.({LitElement:oe});const le=ae.litElementPolyfillSupport;le?.({LitElement:oe}),(ae.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:y},ce=(e=de,t,i)=>{const{kind:n,metadata:s}=i;let r=globalThis.litPropertyMetadata.get(s);if(void 0===r&&globalThis.litPropertyMetadata.set(s,r=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const s=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,s,e,!0,i)},init(t){return void 0!==t&&this.C(n,void 0,e,t),t}}}if("setter"===n){const{name:n}=i;return function(i){const s=this[n];t.call(this,i),this.requestUpdate(n,s,e,!0,i)}}throw Error("Unsupported decorator location: "+n)};function pe(e){return(t,i)=>"object"==typeof i?ce(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function _e(e){return pe({...e,state:!0,attribute:!1})}const fe=1,ue=3,me=4,ge=e=>(...t)=>({_$litDirective$:e,values:t});let be=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const we=ge(class extends be{constructor(e){if(super(e),e.type!==fe||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const n=!!t[e];n===this.st.has(e)||this.nt?.has(e)||(n?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),ye="important",ve=" !"+ye,xe=ge(class extends be{constructor(e){if(super(e),e.type!==fe||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const n=e[i];return null==n?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const n=t[e];if(null!=n){this.ft.add(e);const t="string"==typeof n&&n.endsWith(ve);e.includes("-")||t?i.setProperty(e,t?n.slice(0,-11):n,t?ye:""):i[e]=n}}return I}}),ke="wl-austria-fonts";var $e={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie einen anderen Sensor oder entfernen Sie ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_clear_btn:"Löschen",editor:{lines_label:"Linien",direction_label:"Richtung",per_line_direction_label:"Richtung pro Linie",per_line_direction_hint:"Optional: Richtung pro Linie festlegen. Beide = dem Feld Richtung folgen.",per_line_direction_aria:"Richtung für Linie {line}",direction_unavailable:"Keine Abfahrten in dieser Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis Sie dort sind. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_platform:"Gleis/Steig anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Hauptbereich anzeigen",show_departures:"Abfahrtsliste anzeigen",show_stops_ahead:"Zwischenstopps anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Se={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",barrier_free_title:"Barrierefrei zugänglich",unit_min:"min",via_prefix:"ÜBER",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{direction:"Richtung",line:"Linie",size:"Größe",style:"Stil",station_bg:"Stationsschild-Hintergrund",section_display:"Anzeige",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis Sie dort sind. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",platform_side:"Gleis/Steig-Seite",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_left:"Immer links",platform_side_right:"Immer rechts",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_classic:"Klassisch",style_warm:"Warm",style_pixel:"Punktmatrix",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",flicker:"Linien-Flimmern",wheelchair_race:"Rollstuhl-Rennen",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",message_text:"Nachricht",message_text_helper:"Der Text, der über die Anzeige läuft.",section_header:"Stationskopfzeile",section_header_helper:"Schwarzer Streifen über dem Stationsnamen, wie auf U-Bahn-Schildern. Optional.",show_header:"Stationskopfzeile anzeigen",show_header_helper:"Einschalten zeigt den schwarzen Streifen über dem Stationsnamen. Einstellungen pro Seite bleiben gespeichert.",header_left:"Linke Seite",header_left_helper:"Ausgangssymbol am linken Rand.",header_right:"Rechte Seite",header_right_helper:"Ausgangssymbol am rechten Rand.",exit:"Ausgangssymbol",header_exit_none:"Kein",header_exit_regular:"Ausgang",header_exit_accessible:"Stufenloser Ausgang",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",show_wc:"WC-Symbol anzeigen",show_escalator:"Rolltreppen-Symbol anzeigen",show_elevator:"Aufzug-Symbol anzeigen",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als weiße Plakette am innen liegenden Rand dieser Seite.",clock_style:"Uhr-Stil",clock_style_helper:"Flach: weiße Plakette mit Uhr-Symbol. Solari: Klappanzeige wie an Bahnhöfen, Ziffern klappen bei jeder Minute.",clock_style_flat:"Flach",clock_style_solari:"Solari (Klappanzeige)",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als weiße Plakette neben der Uhr.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",section_tweaks:"Feinschliff",section_tweaks_helper:"Optische Extras. Beeinflussen nichts an den Daten, ändern nur das Aussehen.",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",line_pill:"Linien-Plakette",line_pill_helper:"Liniencode als gefüllte Plakette in der offiziellen Linienfarbe mit weißer LED-Schrift.",line_stripe:"Linien-Seitenstreifen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",housing:"LED-Gehäuse",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf."}},Ae={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",unit_min:"min",editor:{direction:"Richtung",line:"Linie",size:"Größe",section_display:"Anzeige",section_platform:"Gleis-Spalte",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis Sie dort sind. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–4).",show_station_header:"Stations-Kopfband anzeigen",show_station_header_helper:"WL-oranges Band mit Stationsname und Uhrzeit am oberen Rand.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",show_platform:"Gleis/Steig anzeigen",platform_side:"Gleis/Steig-Seite",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_left:"Immer links",platform_side_right:"Immer rechts"}},ze={modern:$e,retro:Se,flap:Ae},Ee={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{lines_label:"Lines",direction_label:"Direction",per_line_direction_label:"Per-line direction",per_line_direction_hint:"Optional: pick a direction per line. Both = follow the Direction field.",per_line_direction_aria:"Direction for line {line}",direction_unavailable:"No departures in this direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",accessibility_only:"Only show step-free departures",show_type_icon:"Show vehicle-type icon",show_platform:"Show platform / track",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show featured departure",show_departures:"Show departure list",show_stops_ahead:"Show intermediate stops",show_qr_button:"Show QR-code button",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",layout:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_lines_available:"Lines appear here once stops are selected."}},Re={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"BAY",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",barrier_free_title:"Step-free access",unit_min:"min",via_prefix:"VIA",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{direction:"Direction",line:"Line",size:"Size",style:"Style",station_bg:"Station-name background",section_display:"Display",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform / track",platform_side:"Platform side",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_left:"Always left",platform_side_right:"Always right",show_station_name:"Show station name",section_station:"Station name sign",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_classic:"Classic",style_warm:"Warm",style_pixel:"Dot matrix",accessibility_only:"Only show step-free departures",flicker:"Line badge flicker",wheelchair_race:"Wheelchair race",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",message_text:"Message",message_text_helper:"The text that scrolls across the display.",section_header:"Station header",section_header_helper:"Black strip above the station name, like on U-Bahn signs. Optional.",show_header:"Show station header",show_header_helper:"Turn on to show the black strip above the station name. Per-side settings stay saved when off.",header_left:"Left side",header_left_helper:"Exit icon sits on the left edge.",header_right:"Right side",header_right_helper:"Exit icon sits on the right edge.",exit:"Exit icon",header_exit_none:"None",header_exit_regular:"Exit",header_exit_accessible:"Step-free exit",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs",text:"Sign text",text_helper:"E.g. name of the next station.",show_wc:"Show toilet icon",show_escalator:"Show escalator icon",show_elevator:"Show elevator icon",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a white chip at the innermost edge of this side.",clock_style:"Clock style",clock_style_helper:"Flat: white chip with a clock icon. Solari: split-flap display like a station board — digits flap on every minute change.",clock_style_flat:"Flat",clock_style_solari:"Solari (split-flap)",show_date:"Show date chip",show_date_helper:"Current date as a white chip next to the clock.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",section_tweaks:"Tweaks",section_tweaks_helper:"Visual flourishes. No data behaviour, just looks.",show_unit:'Show "min" unit',show_unit_helper:'Trail each countdown number with a small amber "min" caption.',line_pill:"Line-colour pill",line_pill_helper:"Render the line code as a filled pill in the official line colour with white LED text.",line_stripe:"Line-colour side stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",housing:"LED housing",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top."}},Ce={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"BAY",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",unit_min:"min",editor:{direction:"Direction",line:"Line",size:"Size",section_display:"Display",section_platform:"Platform column",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–4).",show_station_header:"Show station header band",show_station_header_helper:"WL-orange band with the station name and current time at the top of the card.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",accessibility_only:"Only show step-free departures",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",size_small:"Small",size_medium:"Medium",size_regular:"Regular",show_platform:"Show platform / track",platform_side:"Platform side",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_left:"Always left",platform_side_right:"Always right"}},Le={modern:Ee,retro:Re,flap:Ce};const He={de:Object.freeze({__proto__:null,default:ze,flap:Ae,modern:$e,retro:Se}),en:Object.freeze({__proto__:null,default:Le,flap:Ce,modern:Ee,retro:Re})},Me=He.de??{};function Te(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Pe(e,t,i){const n=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let s=Te(e,He[n]??Me);if(void 0===s&&(s=Te(e,Me)),void 0===s)return e;if(i)for(const[e,t]of Object.entries(i))s=s.replace(`{${e}}`,String(t));return s}function Ne(e,t,i="banner"){if(!e)return K;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return j`
      <div class=${i} role="alert" aria-live="assertive">
        <span>${e}</span>
      </div>
    `}const n=t("version_update").replace("{v}",e),s=t("version_reload");return j`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${n}</span>
      <button
        type="button"
        aria-label=${s}
        @click=${()=>function(e){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}if(e)try{window.sessionStorage?.setItem(`wl-reload-attempted-${e}`,"1")}catch{}window.location.reload()}(e)}
      >
        ${s}
      </button>
    </div>
  `}const De={},Oe=ge(class extends be{constructor(e){if(super(e),e.type!==ue&&e.type!==fe&&e.type!==me)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===I||t===K)return t;const i=e.element,n=e.name;if(e.type===ue){if(t===i[n])return I}else if(e.type===me){if(!!t===i.hasAttribute(n))return I}else if(e.type===fe&&i.getAttribute(n)===t+"")return I;return((e,t=De)=>{e._$AH=t})(e),t}}),Fe=a`
  :host {
    display: block;
  }
  .editor {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .editor-section {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
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
`;function We(e){e.stopPropagation()}function Ue(e,t){return`${e}|${t}`}function Be(e,t){if(!e)return[];const i=new Set;if(e.tracked_line_keys?.length){for(const n of e.tracked_line_keys){const[e,s]=n.split("|",2);e&&(t&&s!==t||i.add(e))}if(i.size>0)return[...i].sort()}for(const n of e.departures??[])t&&n.direction!==t||n.line&&i.add(n.line);return[...i].sort()}function je(e,t){const{lines:i,direction:n,line_directions:s,walk_times:r,accessibility_only:a}=t,o=i&&i.length?new Set(i):null;return e.filter(e=>{if(o&&!o.has(e.line))return!1;const t=s?.[e.line]??n;if(t&&e.direction!==t)return!1;if(r){const t=r[Ue(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(a&&!e.barrier_free)})}
// Config normaliser for the Wiener Linien Austria flap card.
const Ie=new Set(["small","medium","regular"]),Ke=new Set(["auto","left","right"]);function Ge(e,t){return"boolean"==typeof e?e:t}function qe(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,n]of Object.entries(e)){const e="number"==typeof n?n:"string"==typeof n?Number(n):NaN;if(!Number.isFinite(e))continue;if(e<0||e>120)continue;const s=i.split("|"),r=s.length>=3?`${s[0]}|${s[1]}`:i,a=Math.round(e),o=t[r];t[r]=void 0===o?a:Math.max(o,a)}return Object.keys(t).length?t:void 0}const Ve=new Set(["type","entity","direction","line","size","max_rows","show_platform","platform_side","show_station_header","show_min_unit","show_accessibility","accessibility_only","walk_times"]);function Ze(e){const t="R"===e.direction?"R":"H",i=Ie.has(e.size)?e.size:"regular",n=Ke.has(e.platform_side)?e.platform_side:"auto",s=Number(e.max_rows),r=Number.isFinite(s)?Math.max(1,Math.min(4,Math.round(s))):2,a={};for(const[t,i]of Object.entries(e))Ve.has(t)||(a[t]=i);return{...a,type:e.type||"custom:wiener-linien-austria-flap-card",entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,size:i,max_rows:r,show_platform:Ge(e.show_platform,!0),platform_side:n,show_station_header:Ge(e.show_station_header,!0),show_min_unit:Ge(e.show_min_unit,!0),show_accessibility:Ge(e.show_accessibility,!0),accessibility_only:!0===e.accessibility_only,walk_times:qe(e.walk_times)}}
// Schema-driven Lovelace editor for the Wiener Linien Austria flap card.
let Qe=class extends oe{constructor(){super(...arguments),this._pendingDirectionFix=!1,this._computeLabel=e=>function(e,t){const i=`ui.panel.lovelace.editor.card.generic.${e.name}`,n=t.hass?.localize?.(i);if(n)return n;const s=t.et(e.name);if(s!==`${t.editorNamespace}.${e.name}`&&s!==e.name)return s;if(t.cardLookup&&t.cardNamespace){const i=t.cardLookup(e.name);if(i!==`${t.cardNamespace}.${e.name}`&&i!==e.name)return i}return e.name}(e,{hass:this.hass,et:e=>this._et(e),editorNamespace:"flap.editor",cardLookup:e=>this._t(e),cardNamespace:"flap"}),this._computeHelper=e=>function(e,t){const i=`${e.name}_helper`,n=t.et(i);if(n!==`${t.editorNamespace}.${i}`&&n!==i)return n}(e,{et:e=>this._et(e),editorNamespace:"flap.editor"}),this._onFormChanged=e=>{if(!this._config)return;const t=this._config.entity,i=e.detail.value,n=Ze({...this._config,...i});if(n.entity!==t){const e=this._availableDirections(n.entity);1===e.size&&(n.direction=e.has("H")?"H":"R");const t=Be(this._attrs(n.entity),n.direction);n.line=t[0]}this._commit(n)}}setConfig(e){this._config=Ze(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entity;return!i||t.states[i]!==this.hass.states[i]}willUpdate(e){(e.has("_config")||e.has("hass"))&&this._scheduleDirectionAutocorrect()}_t(e){return Pe(`flap.${e}`,{hassLanguage:this.hass?.language})}_et(e){return Pe(`flap.editor.${e}`,{hassLanguage:this.hass?.language})}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_linesForCurrent(){return this._config?Be(this._attrs(this._config.entity),this._config.direction):[]}_terminiForDirection(e){const t=this._attrs(this._config?.entity);if(!t)return[];const i=this._config?.line,n=new Set;for(const s of t.departures??[])s.direction===e&&s.towards&&(i&&s.line!==i||n.add(s.towards));return[...n].sort()}_directionLabel(e){return function(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),n=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${n}`}(this._terminiForDirection(e),{full:this._t("H"===e?"dir_h":"dir_r"),short:this._t("H"===e?"dir_h_short":"dir_r_short")})}_availableDirections(e=this._config?.entity){const t=this._attrs(e),i=new Set;if(t?.tracked_line_keys?.length){for(const e of t.tracked_line_keys){const[,t]=e.split("|",2);"H"!==t&&"R"!==t||i.add(t)}if(i.size>0)return i}for(const e of t?.departures??[])"H"!==e.direction&&"R"!==e.direction||i.add(e.direction);return i}_schema(){const e=this._linesForCurrent(),t=this._config?.line,i=(t&&!e.includes(t)?[t,...e]:e).map(e=>({value:e,label:e})),n=this._availableDirections(),s=[];return(0===n.size||n.has("H"))&&s.push({value:"H",label:this._directionLabel("H")}),(0===n.size||n.has("R"))&&s.push({value:"R",label:this._directionLabel("R")}),[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"wiener_linien_austria"}}},{name:"direction",selector:{select:{mode:"dropdown",options:s}}},{name:"line",selector:{select:{mode:"dropdown",custom_value:!0,options:i}}},{type:"expandable",name:"display",title:this._et("section_display"),flatten:!0,schema:[{name:"max_rows",selector:{number:{min:1,max:4,step:1,mode:"slider"}}},{name:"show_station_header",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",selector:{boolean:{}}},{name:"show_min_unit",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"size",selector:{select:{mode:"list",options:[{value:"small",label:this._et("size_small")},{value:"medium",label:this._et("size_medium")},{value:"regular",label:this._et("size_regular")}]}}}]}]},{type:"expandable",name:"platform_section",title:this._et("section_platform"),flatten:!0,schema:[{name:"show_platform",selector:{boolean:{}}},{name:"platform_side",selector:{select:{mode:"dropdown",options:[{value:"auto",label:this._et("platform_side_auto")},{value:"left",label:this._et("platform_side_left")},{value:"right",label:this._et("platform_side_right")}]}}}]}]}_formData(){return this._config?{...this._config}:{}}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_setWalkTime(e,t){if(!this._config)return;const i=parseInt(t,10),n=Number.isFinite(i)&&i>0?Math.min(120,i):null,s={...this._config.walk_times??{}};null===n?delete s[e]:s[e]=n;const r={...this._config};Object.keys(s).length?r.walk_times=s:delete r.walk_times,this._commit(r)}render(){if(!this._config)return K;const e=this._config,t=!!e.entity&&!this.hass?.states?.[e.entity];return j`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
        ${t?j`<ha-alert alert-type="warning"
              >${this._t("entity_missing").replace("{entity}",e.entity)}</ha-alert
            >`:K}
        ${this._renderWalkTimeSection()}
      </div>
    `}_scheduleDirectionAutocorrect(){if(!this._config||this._pendingDirectionFix)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";this._config.direction!==t&&(this._pendingDirectionFix=!0,Promise.resolve().then(()=>{if(this._pendingDirectionFix=!1,!this._config)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";if(this._config.direction===t)return;const i={...this._config,direction:t},n=Be(this._attrs(i.entity),t);i.line&&n.includes(i.line)||(i.line=n[0]),this._commit(i)}))}_renderWalkTimeSection(){const e=this._config,t=this._attrs(e.entity),i=e.entity?function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),n=Ue(i.line,e);let s=t.get(n);s||(s={line:i.line,direction:e,type:i.type,termini:[]},t.set(n,s)),i.towards&&!s.termini.includes(i.towards)&&s.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(t).filter(t=>t.direction===e.direction):[],n=e.walk_times??{};return j`
      <div class="editor-section">
        <div class="section-header">${this._et("section_walk_time")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${i.length?i.map(e=>{const t=Ue(e.line,e.direction),i=n[t],s=e.termini.join(" / "),r=e.termini.length>1?this._et("walk_time_branching_hint"):"";return j`<div class="walk-time-row">
                  <span class="walk-time-badge">${e.line}</span>
                  <span class="walk-time-towards" title=${r||s}
                    >→ ${s}</span
                  >
                  <input
                    type="number"
                    class="walk-time-input"
                    min="0"
                    max="120"
                    step="1"
                    inputmode="numeric"
                    placeholder=${this._et("walk_time_placeholder")}
                    aria-label=${this._et("walk_time_aria").replace("{line}",e.line).replace("{towards}",s)}
                    .value=${Oe(void 0!==i?String(i):"")}
                    @keydown=${We}
                    @keyup=${We}
                    @keypress=${We}
                    @change=${e=>this._setWalkTime(t,e.target.value)}
                  />
                </div>`}):j`<div class="editor-hint">
                ${this._et("walk_time_no_data")}
              </div>`}
        </div>
      </div>
    `}static{this.styles=[Fe]}};e([pe({attribute:!1})],Qe.prototype,"hass",void 0),e([_e()],Qe.prototype,"_config",void 0),Qe=e([he("wiener-linien-austria-flap-card-editor")],Qe);function Ye(e){if(!e)return[];const t=[];for(const[i,n]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=n?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}
// Wiener Linien Austria — Flap Card (Solari split-flap board).
{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-flap-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-flap-card",name:"Wiener Linien Austria — Flap Board",description:"Solari-style split-flap departure board",preview:!0})}let Je=class extends oe{constructor(){super(...arguments),this._versionMismatch=null,this._flipSnapshots={},this._flipFlipping={},this._flipCleanupTimer=null,this._versionCheckDone=!1,this._fallbackWarned=!1}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-flap-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-flap-card: 'entity' must be a string");this._config=Ze(e)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-flap-card-editor")}static getStubConfig(e){const t=Ye(e)[0]||"";let i="H";const n=e?.states?.[t]?.attributes?.departures;if(Array.isArray(n)){const e=n.some(e=>"H"===e.direction),t=n.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(ke))return;const e=document.createElement("style");e.id=ke,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}disconnectedCallback(){super.disconnectedCallback(),this._clearFlipTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_flipFlipping"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}willUpdate(e){if(!this._config)return;const t=this._resolveEntity();if(!t)return;const i=this.hass?.states?.[t]?.attributes??{},n=je(Array.isArray(i.departures)?i.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,this._config.max_rows);for(let e=0;e<n.length;e++){const t=n[e];if(!t)continue;this._diffFlipField(`row${e}-line`,(t.line??"").toUpperCase()),this._diffFlipField(`row${e}-dest`,(t.towards??"").toUpperCase());const i=Number.isFinite(t.countdown)?t.countdown:null;this._diffFlipField(`row${e}-cd`,null===i?"--":String(i))}for(let e=n.length;e<this._config.max_rows;e++)this._diffFlipField(`row${e}-line`,null),this._diffFlipField(`row${e}-dest`,null),this._diffFlipField(`row${e}-cd`,null)}_clearFlipTimer(){null!==this._flipCleanupTimer&&(clearTimeout(this._flipCleanupTimer),this._flipCleanupTimer=null)}_diffFlipField(e,t){if(null===t)return delete this._flipSnapshots[e],void delete this._flipFlipping[e];const i=this._flipSnapshots[e];if(void 0===i)return void(this._flipSnapshots[e]=t);if(i===t)return;const n=Math.max(i.length,t.length),s={};for(let e=0;e<n;e++){const n=i[e]??"";n!==(t[e]??"")&&(s[e]=n)}this._flipSnapshots={...this._flipSnapshots,[e]:t},0!==Object.keys(s).length&&(this._flipFlipping={...this._flipFlipping,[e]:s},this._clearFlipTimer(),this._flipCleanupTimer=setTimeout(()=>{this._flipCleanupTimer=null,this._flipFlipping={}},1380))}async _checkCardVersion(){this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const n=await e.callWS({type:t});if(n?.version&&n.version!==i)return n.version}catch{}return null}(this.hass,"wiener_linien_austria/flap_card_version","1.5.0")}_resolveEntity(){if(this._config?.entity&&this.hass?.states?.[this._config.entity])return this._config.entity;const e=Ye(this.hass)[0]??null;return e&&this._config?.entity&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-flap-card] configured entity "${this._config.entity}" not in hass.states; falling back to "${e}"`)),e}_t(e,t){return Pe(`flap.${e}`,{hassLanguage:this.hass?.language},t)}render(){if(!this._config)return K;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},n=Array.isArray(i.departures)?i.departures:[],s=je(n,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}).slice(0,e.max_rows),r=s.find(e=>e.platform)?.platform??null,a=e.show_platform?r:null,o="left"===e.platform_side||"right"!==e.platform_side&&"2"===a,l="ptMetro"===(s[0]?.type??""),h=this._t(l?"gleis":"steig"),d=i.stop_name||i.friendly_name||"",c=this._formatClock(i.server_time),p=i.line_colors??{},_={flap:!0,[`flap--size-${e.size}`]:"regular"!==e.size,"flap--gleis-left":!!a&&o,"flap--gleis-right":!!a&&!o};return j`
      <ha-card style="padding:0;overflow:hidden;">
        <div class=${we(_)}>
          ${Ne(this._versionMismatch,e=>this._t(e),"flap-banner")}
          ${e.show_station_header?j`<div class="flap-header" role="group">
                <div class="flap-header__slot"></div>
                <div class="flap-header__station">${d}</div>
                <div class="flap-header__clock">${c??""}</div>
              </div>`:K}
          <div class="flap-panel">
            ${this._renderBoard(t,s,n,a,h,p,o)}
          </div>
        </div>
      </ha-card>
    `}_formatClock(e){if(!e)return null;const t=Date.parse(e);if(!Number.isFinite(t))return null;const i=new Date(t);return`${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`}_renderBoard(e,t,i,n,s,r,a){if(!e)return j`<div class="flap-empty">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,n=i.filter(t=>t.direction===e);let s="no_data";return 0===i.length?s="betriebsschluss":i.length>0&&0===n.length?s="no_data_wrong_direction":t&&n.length>0&&(s="no_data_wrong_line"),j`<div class="flap-empty">${this._t(s)}</div>`}return j`
      <div class="flap-board">
        <ul class="flap-rows" role="list" aria-label=${this._t("departures_list")}>
          ${t.map((e,t)=>this._renderRow(e,t,r))}
        </ul>
        ${n?j`<div class=${a?"flap-gleis flap-gleis--left":"flap-gleis"}>
              <div class="flap-gleis__label">${s}</div>
              ${this._renderTile(n,void 0,0,{wide:!0})}
            </div>`:K}
      </div>
    `}_renderRow(e,t,i){const n=this._config,s=Number.isFinite(e.countdown)?e.countdown:null,r=null!==s&&s<=0,a=(e.line??"?").toUpperCase(),o=(e.towards??"").toUpperCase(),l=[a,o,null===s?this._t("no_data"):r?this._t("at_platform"):this._t("countdown_minutes",{n:String(s)})].filter(Boolean).join(" — "),h=function(e,t,i={},n="var(--primary-color)"){const s=e.toUpperCase();if(void 0!==t[s])return{background:t[s]};if(/^N\d/.test(s))return{background:"#1b1464",color:"#fef200"};const r=i[e]??i[s];return r?.bg?r.fg?{background:`#${r.bg}`,color:`#${r.fg}`}:{background:`#${r.bg}`}:{background:n}}(a,{},i),d={};"var(--primary-color)"!==h.background&&(d.tileBg=h.background,d.tileFg=h.color??"#fff");const c=null===s?j`${this._renderTile("-",void 0,0)}${this._renderTile("-",void 0,1)}`:r?j`<span class="flap-stars" aria-hidden="true"
              ><span>*</span><span>*</span></span
            >`:this._renderFlipString(String(s),`row${t}-cd`);return j`
      <li class="flap-row" aria-label=${l}>
        <div class="flap-cell flap-cell--line" aria-hidden="true">
          ${this._renderFlipString(a,`row${t}-line`,d)}
        </div>
        <div class="flap-cell flap-cell--dest" aria-hidden="true">
          ${this._renderFlipString(o,`row${t}-dest`)}
          ${n.show_accessibility&&e.barrier_free?this._renderPictogramTile("mdi:wheelchair-accessibility",this._t("barrier_free_title")):K}
        </div>
        <div class="flap-cell flap-cell--cd" aria-hidden="true">
          <span class="flap-cd-tiles">${c}</span>
          ${n.show_min_unit&&null!==s&&!r?j`<span class="flap-cd-unit">${this._t("unit_min")}</span>`:K}
        </div>
      </li>
    `}_renderFlipString(e,t,i={}){const n=e.split(""),s=this._flipFlipping[t]??{};return j`<span class="flap-tiles" aria-label=${e}
      >${n.map((e,t)=>this._renderTile(e,s[t],t,i))}</span
    >`}_renderTile(e,t,i,n={}){if(" "===e)return j`<span class="flap-space" aria-hidden="true">&nbsp;</span>`;const s=void 0!==t,r=xe({"--tile-i":String(i),...n.tileBg?{"--tile-bg":n.tileBg}:{},...n.tileFg?{"--tile-fg":n.tileFg}:{}}),a=we({"flap-tile":!0,"flap-tile--wide":!0===n.wide,"flap-tile--color":void 0!==n.tileBg,"flap-tile--flipping":s});return j`<span class=${a} style=${r}>
      <span class="flap-tile__half flap-tile__half--top"
        ><span class="flap-tile__glyph">${e}</span></span
      >
      <span class="flap-tile__half flap-tile__half--bottom"
        ><span class="flap-tile__glyph">${e}</span></span
      >
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
      ${s?j`<span class="flap-tile__leaf"
            ><span class="flap-tile__glyph">${t}</span></span
          >`:K}
    </span>`}_renderPictogramTile(e,t){return j`<span
      class="flap-tile flap-tile--pictogram"
      aria-label=${t}
    >
      <span class="flap-tile__half flap-tile__half--top"
        ><ha-icon class="flap-tile__pictogram" .icon=${e}></ha-icon></span
      >
      <span class="flap-tile__half flap-tile__half--bottom"
        ><ha-icon class="flap-tile__pictogram" .icon=${e}></ha-icon></span
      >
      <span class="flap-tile__seam" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--l" aria-hidden="true"></span>
      <span class="flap-tile__pin flap-tile__pin--r" aria-hidden="true"></span>
    </span>`}static{this.styles=a`
    :host {
      display: block;
      /* Stacking context for the housing shadow + tile drop-shadows
         so they only compete with each other, not the surrounding
         HA dashboard chrome. */
      isolation: isolate;
      /* Solari palette — exposed as custom properties so a future
         dark-housing / light-housing toggle could swap one rule
         instead of every shadow. */
      --flap-housing: #1a1612;
      --flap-bg: #0d0b08;
      --flap-cream-hi: #f3eacd;
      --flap-cream: #e8ddbe;
      --flap-cream-lo: #cfc29c;
      --flap-ink: #1a1410;
      --flap-seam: rgba(0, 0, 0, 0.6);
      --flap-pin: rgba(0, 0, 0, 0.7);
      --wl-orange: #e97e00;
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
      color: #fff;
      border-radius: 4px 4px 0 0;
      display: grid;
      grid-template-columns: 80px 1fr 80px;
      align-items: center;
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
    .flap-header__clock {
      text-align: right;
      font-family: "Barlow Condensed", "Saira Condensed",
        "WL Sans Condensed", sans-serif;
      font-weight: 700;
      font-size: 22px;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
      opacity: 0.95;
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
    .flap-board {
      display: grid;
      grid-template-columns: 1fr auto;
      column-gap: 14px;
      align-items: center;
    }
    .flap--gleis-left .flap-board {
      grid-template-columns: auto 1fr;
    }
    .flap-rows {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .flap-row {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      column-gap: 14px;
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
         override the cream gradient on every face below. */
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
    .flap-tile--wide .flap-tile__half {
      /* Wide tile (GLEIS digit) — same glyph height, just a wider
         pocket so a 2-digit platform doesn't crowd the seam. */
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
      color: var(--tile-fg, #fff);
    }
    .flap-tile--color .flap-tile__half--bottom {
      background: linear-gradient(
        180deg,
        var(--tile-bg, #888) 0%,
        color-mix(in oklab, var(--tile-bg, #888) 84%, black 16%) 100%
      );
      color: var(--tile-fg, #fff);
    }
    .flap-tile--color .flap-tile__seam {
      background: rgba(0, 0, 0, 0.4);
    }
    .flap-tile--color .flap-tile__seam::after {
      background: rgba(255, 255, 255, 0.22);
    }
    /* Pictogram tile — same housing as a glyph tile, the inner MDI
       icon sized to ~60 % so it sits centred with the seam crossing
       through it. */
    .flap-tile--pictogram .flap-tile__half {
      align-items: center;
    }
    .flap-tile__pictogram {
      --mdc-icon-size: 26px;
      width: 32px;
      height: 26px;
      color: var(--flap-ink);
      display: flex;
      align-items: center;
      justify-content: center;
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
      color: var(--tile-fg, #fff);
    }
    .flap-tile--flipping .flap-tile__leaf {
      animation: flapLeaf 180ms cubic-bezier(0.4, 0, 0.7, 1) forwards;
      animation-delay: calc(var(--tile-i, 0) * 70ms);
    }
    @keyframes flapLeaf {
      to {
        transform: rotateX(-90deg);
      }
    }

    /* GLEIS column */
    .flap-gleis {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 0 6px;
      min-width: 60px;
    }
    .flap-gleis--left {
      grid-column: 1;
      grid-row: 1;
    }
    .flap--gleis-left .flap-rows {
      grid-column: 2;
      grid-row: 1;
    }
    .flap-gleis__label {
      font-family: "Work Sans", "WL Sans", sans-serif;
      font-weight: 600;
      font-size: 10px;
      color: var(--flap-cream-lo);
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }

    /* Empty state — same cream / quiet voice as the cd-unit caption
       so the board reads as one cohesive material when no
       departures are flowing. */
    .flap-empty {
      text-align: center;
      padding: 24px 0;
      font-family: "Barlow Condensed", "WL Sans Condensed", sans-serif;
      font-weight: 600;
      font-size: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--flap-cream-lo);
    }
    .flap-stars {
      display: inline-flex;
      gap: 4px;
      color: var(--flap-cream);
      font-weight: 700;
      font-size: 28px;
    }
    .flap-stars > span {
      animation: flapStarBlink 1s infinite;
    }
    .flap-stars > span:nth-child(2) {
      animation-delay: 0.5s;
    }
    @keyframes flapStarBlink {
      0%,
      49.99% {
        opacity: 1;
      }
      50%,
      100% {
        opacity: 0;
      }
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

    /* prefers-reduced-motion — Solari is showy and continuous. Drop
       the rotation, swap to a 60 ms crossfade. Static bottom still
       carries the value; user sees a smooth swap rather than an
       abrupt snap. */
    @media (prefers-reduced-motion: reduce) {
      .flap-tile--flipping .flap-tile__leaf {
        animation: flapLeafFade 60ms ease-out forwards;
        animation-delay: 0ms;
      }
      .flap-stars > span {
        animation: none;
      }
      @keyframes flapLeafFade {
        to {
          opacity: 0;
        }
      }
    }
  `}};e([pe({attribute:!1})],Je.prototype,"hass",void 0),e([_e()],Je.prototype,"_config",void 0),e([_e()],Je.prototype,"_versionMismatch",void 0),e([_e()],Je.prototype,"_flipSnapshots",void 0),e([_e()],Je.prototype,"_flipFlipping",void 0),Je=e([he("wiener-linien-austria-flap-card")],Je);export{Je as WienerLinienAustriaFlapCard};
