// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function t(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new n(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,_=f.trustedTypes,g=_?_.emptyScript:"",v=f.reactiveElementPolyfillSupport,m=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),y={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&c(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:s}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const n=r?.call(this);s?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),s=e.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=r;const n=s.fromAttribute(e,t.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(t,e,i,r=!1,s){if(void 0!==t){const n=this.constructor;if(!1===r&&(s=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??b)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==s||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,v?.({ReactiveElement:$}),(f.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,S=t=>t,A=x.trustedTypes,k=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+T,z=`<${C}>`,D=document,U=()=>D.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,O="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,P=/>/g,H=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,B=/"/g,W=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),q=new WeakMap,V=D.createTreeWalker(D,129);function G(t,e){if(!L(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let s,n=2===e?"<svg>":3===e?"<math>":"",o=R;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===R?"!--"===l[1]?o=N:void 0!==l[1]?o=P:void 0!==l[2]?(W.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=s??R,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?H:'"'===l[3]?B:j):o===B||o===j?o=H:o===N||o===P?o=R:(o=H,s=void 0);const h=o===H&&t[e+1].startsWith("/>")?" ":"";n+=o===R?i+z:c>=0?(r.push(a),i.slice(0,c)+E+i.slice(c)+T+h):i+T+(-2===c?e:h)}return[G(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,n=0;const o=t.length-1,a=this.parts,[l,c]=Z(t,e);if(this.el=J.createElement(l,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=V.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(E)){const e=c[n++],i=r.getAttribute(t).split(T),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?et:"?"===o[1]?it:"@"===o[1]?rt:tt}),r.removeAttribute(t)}else t.startsWith(T)&&(a.push({type:6,index:s}),r.removeAttribute(t));if(W.test(r.tagName)){const t=r.textContent.split(T),e=t.length-1;if(e>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],U()),V.nextNode(),a.push({type:2,index:++s});r.append(t[e],U())}}}else if(8===r.nodeType)if(r.data===C)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(T,t+1));)a.push({type:7,index:s}),t+=T.length-1}s++}}static createElement(t,e){const i=D.createElement("template");return i.innerHTML=t,i}}function Y(t,e,i=t,r){if(e===I)return e;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const n=M(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(t),s._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(e=Y(t,s._$AS(t,e.values),s,r)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??D).importNode(e,!0);V.currentNode=r;let s=V.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new X(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new st(s,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(s=V.nextNode(),n++)}return V.currentNode=D,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Y(this,t,e),M(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==I&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>L(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(D.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new Q(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new J(t)),e}k(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new X(this.O(U()),this.O(U()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=S(t).nextSibling;S(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,s){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(t,e=this,i,r){const s=this.strings;let n=!1;if(void 0===s)t=Y(this,t,e,0),n=!M(t)||t!==this._$AH&&t!==I,n&&(this._$AH=t);else{const r=t;let o,a;for(t=s[0],o=0;o<s.length-1;o++)a=Y(this,r[i+o],e,o),a===I&&(a=this._$AH[o]),n||=!M(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+s[o+1]),this._$AH[o]=a}n&&!r&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class rt extends tt{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){if((t=Y(this,t,e,0)??K)===I)return;const i=this._$AH,r=t===K&&i!==K||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Y(this,t)}}const nt=x.litHtmlPolyfillSupport;nt?.(J,X),(x.litHtmlVersions??=[]).push("3.3.2");const ot=globalThis;let at=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(void 0===s){const t=i?.renderBefore??null;r._$litPart$=s=new X(e.insertBefore(U(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const lt=ot.litElementPolyfillSupport;lt?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:b},ht=(t=dt,e,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,s,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];e.call(this,i),this.requestUpdate(r,s,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return pt({...t,state:!0,attribute:!1})}const ft=1,_t=2,gt=t=>(...e)=>({_$litDirective$:t,values:e});let vt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}},mt=class extends vt{constructor(t){if(super(t),this.it=K,t.type!==_t)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===K||null==t)return this._t=void 0,this.it=t;if(t===I)return t;if("string"!=typeof t)throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}};mt.directiveName="unsafeHTML",mt.resultType=1;const wt=gt(mt),bt=gt(class extends vt{constructor(t){if(super(t),t.type!==ft||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const r=!!e[t];r===this.st.has(t)||this.nt?.has(t)||(r?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return I}}),yt="important",$t=" !"+yt,xt=gt(class extends vt{constructor(t){if(super(t),t.type!==ft||"style"!==t.name||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const r=t[i];return null==r?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(e)),this.render(e);for(const t of this.ft)null==e[t]&&(this.ft.delete(t),t.includes("-")?i.removeProperty(t):i[t]=null);for(const t in e){const r=e[t];if(null!=r){this.ft.add(t);const e="string"==typeof r&&r.endsWith($t);t.includes("-")||e?i.setProperty(t,e?r.slice(0,-11):r,e?yt:""):i[t]=r}}return I}}),St="1.2.0-beta-1",At={U1:"#E3000F",U2:"#A862A4",U3:"#EF7C00",U4:"#00963F",U5:"#008F95",U6:"#9D6830"};var kt={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"min",now:"jetzt",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",dir_h:"H",dir_r:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{section_sensors:"Haltestellen",sensors_hint:"Eine oder mehrere Haltestellen auswählen",section_filters:"Filter pro Haltestelle",filters_hint:"Linien und/oder Richtung pro Haltestelle einschränken",lines_label:"Linien",direction_label:"Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_placeholder:"–",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",hide_attribution:"Datenquelle ausblenden",layout_label:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_sensors_available:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},Et={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",dir_h:"H",dir_r:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",editor:{section_sensor:"Haltestelle",section_direction:"Richtung",section_line:"Linie",section_display:"Darstellung",sensor_hint:"Eine Haltestelle auswählen.",direction_hint:"Hin- oder Rückfahrt — die Retro-Anzeige zeigt nur eine Richtung.",direction_no_data:"Keine Abfahrten in dieser Richtung",line_hint:"Optional: nur eine Linie anzeigen. Aktiven Chip erneut antippen = alle Linien.",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_label:"Hintergrund",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",station_hint:"„Standard“ zeigt U-Bahn-Stationen in der Linienfarbe und alle anderen auf weiß. Oder wähle fix Weiß oder Schwarz.",size_label:"Größe",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_label:"Stil",style_classic:"Klassisch",style_warm:"Warm",flicker_label:"Linien-Flimmern",no_sensors:"Keine Wiener-Linien-Sensoren verfügbar. Erst eine Haltestelle über Einstellungen → Geräte & Dienste hinzufügen.",no_lines:"Für diese Haltestelle und Richtung sind aktuell keine Linien im Sensor."}},Tt={modern:kt,retro:Et},Ct={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"now",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",dir_h:"H",dir_r:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{section_sensors:"Stops",sensors_hint:"Pick one or more stops to display",section_filters:"Per-stop filters",filters_hint:"Optionally restrict lines or direction per stop",lines_label:"Lines",direction_label:"Direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_placeholder:"–",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",hide_attribution:"Hide data source",layout_label:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_sensors_available:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines_available:"Lines appear here once stops are selected."}},zt={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",dir_h:"H",dir_r:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",editor:{section_sensor:"Stop",section_direction:"Direction",section_line:"Line",section_display:"Display",sensor_hint:"Pick a single stop.",direction_hint:"Outbound or return — the retro display only shows one direction.",direction_no_data:"No departures in this direction",line_hint:"Optional: restrict to a single line. Tap the active chip again to show all lines.",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_label:"Background",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",station_hint:"“Default” uses the line colour for U-Bahn stops and white for everything else. Or force white or black for all stops.",size_label:"Size",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_label:"Style",style_classic:"Classic",style_warm:"Warm",flicker_label:"Line badge flicker",no_sensors:"No Wiener Linien sensors available. Add a stop first via Settings → Devices & Services.",no_lines:"The sensor currently reports no lines for this stop + direction."}},Dt={modern:Ct,retro:zt};const Ut={de:Object.freeze({__proto__:null,default:Tt,modern:kt,retro:Et}),en:Object.freeze({__proto__:null,default:Dt,modern:Ct,retro:zt})};function Mt(t,e){const i=function(t,e){return t.split(".").reduce((t,e)=>{if(t&&"object"==typeof t&&e in t)return t[e]},e)}(t,e);return"string"==typeof i?i:void 0}function Lt(t,e,i){const r=function(t){return"en"===(t.configLanguage||t.hassLanguage||"de").replace("-","_").split("_")[0]?"en":"de"}(e);let s=Mt(t,Ut[r]??Ut.de);if(void 0===s&&(s=Mt(t,Ut.de)),void 0===s)return t;if(i)for(const[t,e]of Object.entries(i))s=s.replace(`{${t}}`,String(e));return s}function Ot(t){if("string"==typeof t)return t.startsWith("sensor.")?{entity:t}:null;if(!t||"object"!=typeof t)return null;const e=t,i="string"==typeof e.entity?e.entity:null;if(!i?.startsWith("sensor."))return null;const r={entity:i};if(Array.isArray(e.lines)){const t=e.lines.filter(t=>"string"==typeof t&&t.length>0);t.length&&(r.lines=t)}"H"!==e.direction&&"R"!==e.direction||(r.direction=e.direction);const s=function(t){if(!t||"object"!=typeof t)return;const e={};for(const[i,r]of Object.entries(t)){const t="number"==typeof r?r:"string"==typeof r?Number(r):NaN;Number.isFinite(t)&&(t<0||t>120||(e[i]=Math.round(t)))}return Object.keys(e).length?e:void 0}(e.walk_times);return s&&(r.walk_times=s),r}const Rt=6,Nt=!1,Pt=!0,Ht=!0,jt=!0,Bt=!1;function Wt(t){let e=[];Array.isArray(t.entities)?e=t.entities:"string"==typeof t.entity&&(e=[{entity:t.entity,lines:t.lines,direction:t.direction,walk_times:t.walk_times}]);const i=[],r=new Set;for(const t of e){const e=Ot(t);e&&(r.has(e.entity)||(r.add(e.entity),i.push(e)))}const s=Number(t.max_departures),n=Number.isFinite(s)?Math.max(1,Math.min(20,Math.round(s))):Rt,o={};if(t.line_colors&&"object"==typeof t.line_colors)for(const[e,i]of Object.entries(t.line_colors))"string"==typeof i&&/^#[0-9A-Fa-f]{3,8}$/.test(i.trim())&&(o[e.toUpperCase()]=i.trim());return{type:t.type||"custom:wiener-linien-austria-card",entities:i,max_departures:n,line_colors:o,show_accessibility:t.show_accessibility??Nt,show_traffic_info:t.show_traffic_info??Pt,show_elevator_info:t.show_elevator_info??Ht,show_delay:t.show_delay??jt,hide_attribution:t.hide_attribution??Bt,layout:"tabs"===t.layout?"tabs":"stacked"}}function Ft(t,e,i="var(--primary-color)"){const r=t.toUpperCase();return e[r]??At[r]??i}function It(t){if(!t)return[];const e=[];for(const[i,r]of Object.entries(t.states??{})){if(!i.startsWith("sensor."))continue;const t=r?.attributes??{};if("number"!=typeof t.diva)continue;if(!Array.isArray(t.departures))continue;(t.attribution??"").toLowerCase().includes("wiener linien")&&e.push(i)}return e.sort(),e}function Kt(t,e,i){return`${t}|${e}|${i}`}function qt(t){const e=new Set;for(const i of t?.departures??[])i.line&&e.add(i.line);return Array.from(e).sort()}function Vt(t){return function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}(t).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}function Gt(t,e="de"){if(!t)return"";const i=Date.parse(t);if(!Number.isFinite(i))return t;try{return new Date(i).toLocaleString("en"===e?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return t}}let Zt=class extends at{setConfig(t){this._config=Wt(t)}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_et(t){return Lt(`modern.editor.${t}`,{hassLanguage:this.hass?.language})}_t(t){return Lt(`modern.${t}`,{hassLanguage:this.hass?.language})}_fire(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_updateStop(t,e){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===t?e({...i}):i);this._fire({...this._config,entities:i})}_toggleStop(t){if(!this._config)return;const e=this._config.entities.findIndex(e=>e.entity===t),i=e>=0?this._config.entities.filter((t,i)=>i!==e):[...this._config.entities,{entity:t}];this._fire({...this._config,entities:i})}_toggleLine(t,e){this._updateStop(t,t=>{const i=new Set(t.lines??[]);return i.has(e)?i.delete(e):i.add(e),i.size>0?t.lines=[...i]:delete t.lines,t})}_setDirection(t,e){this._updateStop(t,t=>(null===e?delete t.direction:t.direction=e,t))}_setWalkTime(t,e,i){const r=parseInt(i,10),s=Number.isFinite(r)&&r>0?Math.min(120,r):null;this._updateStop(t,t=>{const i={...t.walk_times??{}};return null===s?delete i[e]:i[e]=s,Object.keys(i).length?t.walk_times=i:delete t.walk_times,t})}_setLineColor(t,e){if(!this._config)return;const i={...this._config.line_colors,[t.toUpperCase()]:e};this._fire({...this._config,line_colors:i})}_resetLineColor(t){if(!this._config)return;const e={...this._config.line_colors};delete e[t.toUpperCase()],this._fire({...this._config,line_colors:e})}_setLayout(t){this._config&&this._config.layout!==t&&this._fire({...this._config,layout:t})}_setMaxDepartures(t){if(!this._config)return;const e=Math.max(1,Math.min(20,Math.round(t)));e!==this._config.max_departures&&this._fire({...this._config,max_departures:e})}_toggleField(t,e){this._config&&this._fire({...this._config,[t]:e})}_swallowKeys(t){t.stopPropagation()}render(){if(!this._config||!this.hass)return K;const t=this._config,e=It(this.hass),i=new Set(t.entities.map(t=>t.entity));return F`
      <div class="editor">
        ${this._renderStopsSection(e,i)}
        ${this._renderFiltersSection()}
        ${this._renderDisplaySection()}
        ${this._renderColorsSection()}
      </div>
    `}_renderStopsSection(t,e){const i=t.length?t.map(t=>{const i=function(t,e){const i=t?.states?.[e],r=i?.attributes??{};return r.stop_name||r.friendly_name||e}(this.hass,t),r=t.split(".")[1]??t,s=e.has(t);return F`
            <button
              type="button"
              class=${bt({chip:!0,selected:s})}
              @click=${()=>this._toggleStop(t)}
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
    `}_renderFiltersSection(){const t=this._config,e=t.entities.length?t.entities.map(t=>this._renderStopFilter(t)):F`<div class="editor-hint">${this._et("sensors_hint")}</div>`;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_filters")}</div>
        <div class="editor-hint">${this._et("filters_hint")}</div>
        ${e}
      </div>
    `}_renderStopFilter(t){const e=this.hass?.states?.[t.entity]?.attributes;if(!e)return F``;const i=e.stop_name||t.entity,r=this._config.line_colors,s=qt(e),n=new Set(t.lines??[]),o=t.direction??null,a=function(t){const e=[],i=new Set;for(const r of t?.departures??[]){const t=Kt(r.line,String(r.direction??""),r.towards);i.has(t)||(i.add(t),e.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return e.sort((t,e)=>t.line===e.line?t.towards.localeCompare(e.towards):t.line.localeCompare(e.line)),e}(e).filter(t=>!o||t.direction===o);return F`
      <div class="stop-filter">
        <div class="stop-filter-header">${i}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${s.length?s.map(e=>{const i=0===n.size||n.has(e),s=Ft(e,r),o=i?{background:s,borderColor:s,color:"#fff"}:{};return F`<button
                    type="button"
                    class=${bt({chip:!0,selected:i})}
                    style=${xt(o)}
                    @click=${()=>this._toggleLine(t.entity,e)}
                  >${e}</button>`}):F`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
          </div>
        </div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("direction_label")}</div>
          <div class="direction-buttons">
            <button
              type="button"
              class=${bt({active:"H"===o})}
              @click=${()=>this._setDirection(t.entity,"H")}
            >${this._t("dir_h")}</button>
            <button
              type="button"
              class=${bt({active:"R"===o})}
              @click=${()=>this._setDirection(t.entity,"R")}
            >${this._t("dir_r")}</button>
            <button
              type="button"
              class=${bt({active:null===o})}
              @click=${()=>this._setDirection(t.entity,null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${a.length?F`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
                <div class="editor-hint">${this._et("walk_time_hint")}</div>
                <div class="walk-time-list">
                  ${a.map(e=>{const i=Ft(e.line,r),s=Kt(e.line,e.direction,e.towards),n=t.walk_times?.[s],o=e.towards?`→ ${e.towards}`:"";return F`
                      <div class="walk-time-row">
                        <span class="walk-time-badge" style=${xt({background:i})}>${e.line}</span>
                        <span class="walk-time-towards" title=${e.towards}>${o}</span>
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
                          @change=${e=>this._setWalkTime(t.entity,s,e.target.value)}
                        />
                      </div>
                    `})}
                </div>
              </div>
            `:K}
      </div>
    `}_renderDisplaySection(){const t=this._config;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_display")}</div>

        <div class="toggle-row" style="gap:12px;">
          <span style="font-size:13px;">${this._et("layout_label")}</span>
          <div class="direction-buttons">
            <button
              type="button"
              class=${bt({active:"stacked"===t.layout})}
              @click=${()=>this._setLayout("stacked")}
            >${this._et("layout_stacked")}</button>
            <button
              type="button"
              class=${bt({active:"tabs"===t.layout})}
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
            .value=${String(t.max_departures)}
            @keydown=${this._swallowKeys}
            @keyup=${this._swallowKeys}
            @keypress=${this._swallowKeys}
            @change=${t=>this._setMaxDepartures(Number(t.target.value))}
          />
          <span class="slider-value">${t.max_departures}</span>
        </div>

        ${this._renderSwitch("show_accessibility",t.show_accessibility)}
        ${this._renderSwitch("show_traffic_info",t.show_traffic_info)}
        ${this._renderSwitch("show_elevator_info",t.show_elevator_info)}
        ${this._renderSwitch("show_delay",t.show_delay)}
        ${this._renderSwitch("hide_attribution",t.hide_attribution)}
      </div>
    `}_renderSwitch(t,e){const i=`wl-${t.replace(/_/g,"-")}-toggle`;return F`
      <div class="toggle-row">
        <label for=${i}>${this._et(t)}</label>
        <ha-switch
          id=${i}
          .checked=${e}
          @change=${e=>this._toggleField(t,e.target.checked)}
        ></ha-switch>
      </div>
    `}_renderColorsSection(){const t=this._config,e=function(t,e){const i=new Set;for(const r of e){const e=t?.states?.[r]?.attributes;for(const t of qt(e))i.add(t)}return Array.from(i).sort()}(this.hass,t.entities.map(t=>t.entity)),i=t.line_colors;return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${e.length?e.map(t=>{const e=Ft(t,i,"#888888"),r=e.startsWith("#")?e:"#888888",s=Boolean(i[t.toUpperCase()]);return F`
                <div class="color-row">
                  <div class="line-preview" style=${xt({background:e})}>${t}</div>
                  <span>${t}</span>
                  <input
                    type="color"
                    .value=${r}
                    @change=${e=>this._setLineColor(t,e.target.value)}
                  />
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!s}
                    @click=${()=>s&&this._resetLineColor(t)}
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
  `}};t([pt({attribute:!1})],Zt.prototype,"hass",void 0),t([ut()],Zt.prototype,"_config",void 0),Zt=t([ct("wiener-linien-austria-card-editor")],Zt),console.info(`%c WIENER-LINIEN-AUSTRIA-CARD %c ${St} `,"color: white; background: #E3000F; font-weight: 700;","color: #E3000F; background: white; font-weight: 700;"),window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0});let Jt=class extends at{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._debugTraffic=[],this._debugElevator=[],this._versionCheckDone=!1,this._devTestTraffic=()=>{const t=this._resolveStops(),e=[];for(const i of t)for(const t of this._attrs(i.entity).departures??[])t.line&&t.towards&&e.push(t);const i=this._randomFrom(e),r=i?.line||"U?",s=i?.towards||"Unbekannt",n=new Date;this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: Testmeldung`,description:`Debug-Eintrag für Linie ${r} Richtung ${s}.`,description_html:`Debug-Eintrag für Linie ${r} Richtung ${s}.<br><br>Grund: Dev-Mode-Test.`,location:"Debug-Stelle",related_lines:[r],time_start:new Date(n.getTime()-18e5).toISOString(),time_end:new Date(n.getTime()+108e5).toISOString(),time_created:new Date(n.getTime()-18e5).toISOString(),time_last_update:n.toISOString(),status:"active"}]},this._devTestElevator=()=>{const t=this._resolveStops(),e=this._randomFrom(t);if(!e)return;const i=this._attrs(e.entity),r=i.stop_name||e.entity,s=i.departures??[],n=this._randomFrom(s)?.line||"",o=this._randomFrom(s)?.towards||"Unbekannt",a=new Date;this._debugElevator=[...this._debugElevator,{__debug_entity:e.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:`${n||"Station"} Bahnsteig Richtung ${o} — Ausgang ${r}`,reason:"AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",status:"außer Betrieb",related_lines:n?[n]:[],time_start:new Date(a.getTime()-27e5).toISOString(),time_end:new Date(a.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[]}}setConfig(t){if(!t||"object"!=typeof t)throw new Error("wiener-linien-austria-card: config must be an object");this._config=Wt(t)}getCardSize(){const t=this._config?.entities.length??1;return Math.min(12,3+3*t)}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(t){const e=It(t);return{type:"custom:wiener-linien-austria-card",entities:e.length?[e[0]]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}shouldUpdate(t){if(!this._config)return!1;if(t.has("_config")||t.has("_activeTab")||t.has("_versionMismatch")||t.has("_expandedTraffic")||t.has("_expandedElevator")||t.has("_debugTraffic")||t.has("_debugElevator"))return!0;const e=t.get("hass");if(!e||!this.hass)return!0;const i=this._resolveStops().map(t=>t.entity);return i.some(t=>e.states[t]!==this.hass.states[t])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(t,e){return Lt(`modern.${t}`,{hassLanguage:this.hass?.language},e)}async _checkCardVersion(){try{const t=await this.hass.callWS({type:"wiener_linien_austria/card_version"});t?.version&&t.version!==St&&(this._versionMismatch=t.version)}catch{}}_resolveStops(){const t=(this._config?.entities??[]).filter(t=>this.hass?.states?.[t.entity]);if(t.length)return t;const e=It(this.hass);return e.length?[{entity:e[0]}]:[]}_attrs(t){return this.hass?.states?.[t]?.attributes??{}}render(){if(!this._config)return K;if(!this.hass)return F`<ha-card><div class="wl-card"></div></ha-card>`;const t=this._config,e=this._resolveStops(),i="tabs"===t.layout&&e.length>=2;i&&this._activeTab>=e.length&&(this._activeTab=0);const r=t.hide_attribution?"":e.map(t=>this._attrs(t.entity).attribution).find(t=>"string"==typeof t&&t.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return F`
      <ha-card>
        <div class="wl-card">
          ${this._versionMismatch?this._renderBanner():K}
          ${t.show_traffic_info?this._renderTrafficBanner(e):K}
          ${this._renderBody(e,i)}
          ${r?F`<div class="wl-attr">${r}</div>`:K}
          ${this._renderDevModePanel()}
        </div>
      </ha-card>
    `}_renderBody(t,e){if(!t.length)return this._renderEmpty();if(e){const e=t[this._activeTab];return F`
        ${this._renderTabs(t,this._activeTab)}
        ${this._renderStop(e)}
      `}return F`${t.map(t=>this._renderStop(t))}`}_renderEmpty(){const t=It(this.hass).length?"no_entities_picked":"no_entities_available";return F`<div class="wl-empty">${this._t(t)}</div>`}_renderTabs(t,e){return F`
      <div class="wl-tabs">
        ${t.map((t,i)=>{const r=this._attrs(t.entity),s=r.stop_name||r.friendly_name||t.entity;return F`<button
            type="button"
            class=${bt({"wl-tab":!0,"wl-tab-active":i===e})}
            @click=${()=>this._setActiveTab(i)}
          >${s}</button>`})}
      </div>
    `}_setActiveTab(t){Number.isFinite(t)&&t!==this._activeTab&&(this._activeTab=t)}_renderStop(t){const e=this._attrs(t.entity),i=e.stop_name||e.friendly_name||t.entity,r=function(t,e){const{lines:i,direction:r,walk_times:s}=e,n=i&&i.length?new Set(i):null;return t.filter(t=>{if(n&&!n.has(t.line))return!1;if(r&&t.direction!==r)return!1;if(s){const e=s[Kt(t.line,String(t.direction??""),t.towards)];if("number"==typeof e&&t.countdown<e)return!1}return!0})}(Array.isArray(e.departures)?e.departures:[],t),s=r.slice(0,this._config.max_departures),n=Array.isArray(e.elevator_info)?e.elevator_info:[],o=this._debugElevator.filter(e=>e.__debug_entity===t.entity),a=[...n,...o],l=this._config.show_elevator_info&&a.length>0,c=this._stopMapUrl(i,e.latitude,e.longitude),d=this._t("open_in_maps");return F`
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
        ${s.length?s.map(t=>this._renderRow(t)):F`<div class="wl-empty">
              ${this._t(e.server_time?"betriebsschluss":"no_data")}
            </div>`}
      </div>
    `}_renderElevatorBadge(t){const e=this._t("elevator_label"),i=t.map(t=>[t.station,t.description,t.reason].filter(t=>!!t).join(" — ")).join("\n");return F`
      <span class="wl-elevator-badge" title="${e}:\n${i}">
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <span class="wl-elevator-badge-text">${e}</span>
      </span>
    `}_renderElevatorDetails(t){return F`
      <div class="wl-elevator-details">
        ${t.map(t=>this._renderElevatorDetail(t))}
      </div>
    `}_renderElevatorDetail(t){const e=t.description||t.station||"",i=t.reason||"",r=Gt(t.time_end,this._lang()),s=Boolean(i||r),n=this._expandedElevator.has(t.name);return F`
      <div
        class=${bt({"wl-elevator-detail":!0,"wl-elevator-expanded":n,"wl-elevator-nodetail":!s})}
        @click=${()=>s&&this._toggleElevator(t.name)}
      >
        <ha-icon icon="mdi:elevator-passenger-off"></ha-icon>
        <div class="wl-elevator-detail-body">
          <div class="wl-elevator-summary">
            <div class="wl-elevator-detail-location">${e}</div>
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
    `}_toggleElevator(t){const e=new Set(this._expandedElevator);e.has(t)?e.delete(t):e.add(t),this._expandedElevator=e}_renderTrafficBanner(t){const e=new Set,i=[];for(const r of t)for(const t of this._attrs(r.entity).traffic_info??[])e.has(t.name)||(e.add(t.name),i.push(t));for(const t of this._debugTraffic)e.has(t.name)||(e.add(t.name),i.push(t));return i.length?F`
      <div class="wl-traffic-list">
        ${i.map(t=>this._renderTrafficItem(t))}
      </div>
    `:K}_renderTrafficItem(t){const e=this._config.line_colors,i=Array.isArray(t.related_lines)?t.related_lines:[],r=t.description_html?Vt(t.description_html):t.description?Vt(t.description):"",s=Gt(t.time_end,this._lang()),n=Gt(t.time_last_update,this._lang()),o=Gt(t.time_created,this._lang()),a=n&&n!==o?n:"",l=Boolean(t.location||s||a),c=Boolean(r||l),d=this._expandedTraffic.has(t.name);return F`
      <div
        class=${bt({"wl-traffic":!0,"wl-traffic-expanded":d,"wl-traffic-nodetail":!c})}
        @click=${()=>c&&this._toggleTraffic(t.name)}
      >
        <ha-icon icon="mdi:alert-octagon"></ha-icon>
        <div class="wl-traffic-body">
          <div class="wl-traffic-summary">
            ${i.length?F`<div class="wl-traffic-lines">
                  ${i.map(t=>F`<span
                      class="wl-traffic-line-badge"
                      style=${xt({background:Ft(t,e)})}
                    >${t}</span>`)}
                </div>`:K}
            <div class="wl-traffic-title">${t.title||this._t("traffic_label")}</div>
          </div>
          ${c?F`<div class="wl-traffic-detail">
                ${r?F`<div class="wl-traffic-desc">${wt(r)}</div>`:K}
                ${l?F`<div class="wl-traffic-meta">
                      ${t.location?F`<span class="wl-traffic-location-chip">
                            <ha-icon icon="mdi:map-marker"></ha-icon>${t.location}
                          </span>`:K}
                      ${s?F`<span>${this._t("traffic_until")} ${s}</span>`:K}
                      ${a?F`<span>${this._t("traffic_updated")} ${a}</span>`:K}
                    </div>`:K}
              </div>`:K}
        </div>
        ${c?F`<ha-icon class="wl-traffic-chevron" icon="mdi:chevron-down"></ha-icon>`:K}
      </div>
    `}_toggleTraffic(t){const e=new Set(this._expandedTraffic);e.has(t)?e.delete(t):e.add(t),this._expandedTraffic=e}_renderRow(t){const e=this._config.line_colors,i=t.line||"?",r=Ft(i,e),s=Number.isFinite(t.countdown)?t.countdown:null,n=null===s?"—":s<=0?this._t("now"):`${s} ${this._t("min")}`,o=this._config.show_delay?function(t,e){if(!t||!e)return null;const i=Date.parse(t),r=Date.parse(e);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(t.time_planned,t.time_real):null,a=null!==o&&o>=1?1===o?this._t("delay_singular"):this._t("delay_plural",{n:o}):"",l=this._config.show_accessibility,c=Boolean(t.traffic_jam||l&&t.barrier_free);return F`
      <div class="wl-row">
        <div class="wl-line" style=${xt({background:r})}>${i}</div>
        <div class="wl-towards">
          ${t.towards||""}${a?F` <span class="wl-delay">${a}</span>`:K}
        </div>
        ${c?F`<span class="wl-flags">
              ${t.traffic_jam?F`<ha-icon
                    class="disturbance"
                    icon="mdi:alert-circle"
                    title=${this._t("disturbance_title")}
                  ></ha-icon>`:K}
              ${l&&t.barrier_free?F`<ha-icon
                    class="a11y"
                    icon="mdi:wheelchair-accessibility"
                    title=${this._t("barrier_free_title")}
                  ></ha-icon>`:K}
            </span>`:F`<span></span>`}
        <div class="wl-countdown">${n}</div>
      </div>
    `}_stopMapUrl(t,e,i){return"number"==typeof e&&"number"==typeof i?`https://www.google.com/maps/search/?api=1&query=${e},${i}`:t?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t}, Wien`)}`:null}_renderBanner(){const t=this._t("version_update",{v:this._versionMismatch??""});return F`
      <div class="wl-banner">
        <span>${t}</span>
        <button type="button" @click=${this._reload}>${this._t("version_reload")}</button>
      </div>
    `}async _reload(){try{if(window.caches?.keys){const t=await window.caches.keys();await Promise.all(t.map(t=>window.caches.delete(t)))}}catch{}window.location.reload()}_isDevMode(){try{const t=window.location.hostname||"";if("rpi25"===t||t.startsWith("rpi25."))return!0;if((window.location.search||"").includes("wl_debug=1"))return!0}catch{}return!1}_renderDevModePanel(){return this._isDevMode()?F`
      <div class="wl-devmode">
        <span class="wl-devmode-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="wl-devmode-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `:K}_randomFrom(t){return t.length?t[Math.floor(Math.random()*t.length)]:null}static{this.styles=o`
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
  `}};t([pt({attribute:!1})],Jt.prototype,"hass",void 0),t([ut()],Jt.prototype,"_config",void 0),t([ut()],Jt.prototype,"_activeTab",void 0),t([ut()],Jt.prototype,"_versionMismatch",void 0),t([ut()],Jt.prototype,"_expandedTraffic",void 0),t([ut()],Jt.prototype,"_expandedElevator",void 0),t([ut()],Jt.prototype,"_debugTraffic",void 0),t([ut()],Jt.prototype,"_debugElevator",void 0),Jt=t([ct("wiener-linien-austria-card")],Jt);export{Jt as WienerLinienAustriaCard};
