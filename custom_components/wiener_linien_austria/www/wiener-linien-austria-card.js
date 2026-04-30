// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,s=arguments.length,a=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var o=e.length-1;o>=0;o--)(n=e[o])&&(a=(s<3?n(a):s>3?n(t,i,a):n(t,i))||a);return s>3&&a&&Object.defineProperty(t,i,a),a}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new s(i,e,r)},o=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new s("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,f=_.trustedTypes,g=f?f.emptyScript:"",m=_.reactiveElementPolyfillSupport,b=(e,t)=>e,w={toAttribute(e,t){switch(t){case Boolean:e=e?g:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},v=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const s=r?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:w;this._$Em=r;const s=n.fromAttribute(t,e.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const s=this.constructor;if(!1===r&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??v)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,m?.({ReactiveElement:$}),(_.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,A=x.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+z,C=`<${T}>`,R=document,H=()=>R.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,N="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,P=/-->/g,O=/>/g,U=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,B=/"/g,W=/^(?:script|style|textarea|title)$/i,F=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),I=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),G=new WeakMap,V=R.createTreeWalker(R,129);function q(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let n,s=2===t?"<svg>":3===t?"<math>":"",a=M;for(let t=0;t<i;t++){const i=e[t];let o,l,d=-1,c=0;for(;c<i.length&&(a.lastIndex=c,l=a.exec(i),null!==l);)c=a.lastIndex,a===M?"!--"===l[1]?a=P:void 0!==l[1]?a=O:void 0!==l[2]?(W.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=U):void 0!==l[3]&&(a=U):a===U?">"===l[0]?(a=n??M,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?U:'"'===l[3]?B:j):a===B||a===j?a=U:a===P||a===O?a=M:(a=U,n=void 0);const h=a===U&&e[t+1].startsWith("/>")?" ":"";s+=a===M?i+C:d>=0?(r.push(o),i.slice(0,d)+E+i.slice(d)+z+h):i+z+(-2===d?t:h)}return[q(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Y{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,s=0;const a=e.length-1,o=this.parts,[l,d]=Z(e,t);if(this.el=Y.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=V.nextNode())&&o.length<a;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(E)){const t=d[s++],i=r.getAttribute(e).split(z),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:n,name:a[2],strings:i,ctor:"."===a[1]?te:"?"===a[1]?ie:"@"===a[1]?re:ee}),r.removeAttribute(e)}else e.startsWith(z)&&(o.push({type:6,index:n}),r.removeAttribute(e));if(W.test(r.tagName)){const e=r.textContent.split(z),t=e.length-1;if(t>0){r.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],H()),V.nextNode(),o.push({type:2,index:++n});r.append(e[t],H())}}}else if(8===r.nodeType)if(r.data===T)o.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(z,e+1));)o.push({type:7,index:n}),e+=z.length-1}n++}}static createElement(e,t){const i=R.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===I)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const s=L(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class Q{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??R).importNode(t,!0);V.currentNode=r;let n=V.nextNode(),s=0,a=0,o=i[0];for(;void 0!==o;){if(s===o.index){let t;2===o.type?t=new X(n,n.nextSibling,this,e):1===o.type?t=new o.ctor(n,o.name,o.strings,this,e):6===o.type&&(t=new ne(n,this,e)),this._$AV.push(t),o=i[++a]}s!==o?.index&&(n=V.nextNode(),s++)}return V.currentNode=R,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),L(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==I&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(R.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new Q(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new Y(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new X(this.O(H()),this.O(H()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,r){const n=this.strings;let s=!1;if(void 0===n)e=J(this,e,t,0),s=!L(e)||e!==this._$AH&&e!==I,s&&(this._$AH=e);else{const r=e;let a,o;for(e=n[0],a=0;a<n.length-1;a++)o=J(this,r[i+a],t,a),o===I&&(o=this._$AH[a]),s||=!L(o)||o!==this._$AH[a],o===K?e=K:e!==K&&(e+=(o??"")+n[a+1]),this._$AH[a]=o}s&&!r&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class re extends ee{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??K)===I)return;const i=this._$AH,r=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ne{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=x.litHtmlPolyfillSupport;se?.(Y,X),(x.litHtmlVersions??=[]).push("3.3.2");const ae=globalThis;let oe=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(H(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}};oe._$litElement$=!0,oe.finalized=!0,ae.litElementHydrateSupport?.({LitElement:oe});const le=ae.litElementPolyfillSupport;le?.({LitElement:oe}),(ae.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ce={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:v},he=(e=ce,t,i)=>{const{kind:r,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e=1,fe=2,ge=e=>(...t)=>({_$litDirective$:e,values:t});let me=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},be=class extends me{constructor(e){if(super(e),this.it=K,e.type!==fe)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===K||null==e)return this._t=void 0,this.it=e;if(e===I)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}};be.directiveName="unsafeHTML",be.resultType=1;const we=ge(be),ve=ge(class extends me{constructor(e){if(super(e),e.type!==_e||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return I}}),ye="important",$e=" !"+ye,xe=ge(class extends me{constructor(e){if(super(e),e.type!==_e||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith($e);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?ye:""):i[e]=r}}return I}}),ke=a`
  :host {
    /* color-scheme enables light-dark() and steers forced-colors
       palette selection (WCAG 1.4.11). HA's active theme drives the
       resolution; the card just opts in. */
    color-scheme: light dark;
    display: block;
    container-type: inline-size;
    container-name: wlcard;

    /* Brand accent inherits HA's primary. Per-station accent override
       lands inline on .station via style="--wl-accent: …;". */
    --wl-accent: var(--primary-color);

    /* Semantic state tokens layered over HA's official semantic palette
       so theme authors can recolour the whole portfolio in one place;
       hard-coded fallbacks for older HA versions. */
    --wl-rt:      var(--ha-color-success, #43a047);
    --wl-warning: var(--ha-color-warning, #ffa000);
    --wl-error:   var(--ha-color-error,   #db4437);
    --wl-info:    var(--ha-color-info,    #1565c0);

    /* Spacing / radius / sizing — layered over the HA Design System
       so the card moves with HA when tokens evolve. Values match
       linz-linien-austria so a stacked dashboard reads as one
       family. */
    --wl-radius-sm: var(--ha-radius-sm, 6px);
    --wl-radius-md: var(--ha-radius-md, 10px);
    --wl-radius-lg: var(--ha-card-border-radius, var(--ha-radius-lg, 12px));
    --wl-pad-x:     var(--ha-spacing-4, 16px);
    --wl-pad-y:     var(--ha-spacing-3, 14px);
    --wl-row-gap:   var(--ha-spacing-3, 12px);
    --wl-tile-size: 40px;
    --wl-slot-radius: var(--ha-radius-md, 10px);
    --wl-slot-gap: 6px;
    --wl-slot-min-h: 44px;
    --wl-metric-size: 2.25rem;
  }

  ha-card {
    overflow: hidden;
  }

  .wrap {
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
    padding: var(--wl-pad-y) var(--wl-pad-x);
  }

  /* Tabs sit flush with the card edge — direct child of <ha-card>, not
     inside .wrap. Three active cues (colour + weight + inset underline)
     so the active tab reads without colour vision. */
  .tabs {
    display: flex;
    height: 44px;
    padding: 0 14px;
    border-bottom: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    flex: 1 0 auto;
    min-width: 0;
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--secondary-text-color);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), box-shadow var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
  }
  .tab:hover {
    color: var(--primary-text-color);
  }
  .tab.active {
    color: var(--primary-color);
    font-weight: var(--ha-font-weight-bold, 600);
    box-shadow: inset 0 -2px 0 var(--primary-color);
  }

  /* Per-station section. Inline --wl-accent on this element drives the
     icon-tile tint, line-badge fallback, alert tints, and CTA fill. */
  .station {
    display: flex;
    flex-direction: column;
    gap: var(--wl-row-gap);
  }
  .station + .station {
    margin-top: var(--wl-row-gap);
    padding-top: var(--wl-row-gap);
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  /* Header: square accent tile (left), title block (centre), circular
     icon-action (right). Mirrors HA's hui-tile-card composition. */
  .head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-tile {
    width: var(--wl-tile-size);
    height: var(--wl-tile-size);
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-accent) 18%, transparent);
    color: var(--wl-accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    forced-color-adjust: none;
  }
  .icon-tile ha-icon {
    --mdc-icon-size: 22px;
  }
  .title-block {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .title {
    margin: 0;
    font-size: var(--ha-font-size-m, 0.9375rem);
    font-weight: 600;
    color: var(--primary-text-color);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    margin: 2px 0 0;
    font-size: 0.75rem;
    color: var(--secondary-text-color);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .head-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
  }
  .icon-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background-color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), color var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
  }
  .icon-action:hover {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-text-color);
  }
  .icon-action ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Hero block — Linz-Linien-aligned layout: tinted background, big
     countdown on the left, line-badge + direction column on the right.
     Matches linz-linien-austria so a stacked dashboard reads as one
     visual family. The per-station --wl-accent (set inline on .station)
     drives the tint and the big-number colour; the row beside lists
     the next departure's line, direction, platform, and a realtime
     pill if applicable. */
  .hero {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--ha-spacing-3, 12px);
    row-gap: 6px;
    align-items: center;
    /* Cosmetics (background, padding, radius) live on .hero-host so
       the tinted surface visually contains both the grid and any
       expanded stops_ahead panel below. The .hero grid itself just
       does layout — entries + their panels live in column 2 in
       interleaved row order so each panel sits directly below its
       trigger entry; .hero-time pins to row 1 of column 1 and stays
       vertically centred against the first entry regardless of
       which panels expand below. */
  }
  .hero > .hero-time {
    grid-column: 1;
    grid-row: 1;
  }
  .hero > .hero-entry,
  .hero > .hero-detail {
    grid-column: 2;
  }
  .hero-time {
    display: flex;
    align-items: baseline;
    gap: 4px;
    color: var(--wl-accent);
  }
  .hero-min {
    font-size: var(--wl-metric-size);
    font-weight: var(--ha-font-weight-bold, 600);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .hero-unit {
    font-size: var(--ha-font-size-m, 1rem);
    font-weight: 600;
    color: var(--secondary-text-color);
  }
  /* hero-host carries the cosmetics (background, padding, radius)
     so the tinted surface wraps both the .hero grid and any
     expanded stops_ahead panels in one continuous block. */
  .hero-host {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: var(--ha-spacing-3, 12px) var(--wl-pad-x);
    background: color-mix(in srgb, var(--wl-accent) 12%, transparent);
    border-radius: var(--wl-radius-lg);
  }
  .hero-entry {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .hero-entry.expandable {
    cursor: pointer;
    user-select: none;
    border-radius: 6px;
  }
  .hero-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    margin-left: auto;
    flex-shrink: 0;
    /* will-change promotes the chevron to its own composite layer so
       the rotation animates on the GPU instead of triggering a layout
       pass that nudges flex siblings during the transition. */
    will-change: transform;
    transition: transform
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .hero-entry.expanded .hero-chevron {
    transform: rotate(180deg);
  }
  /* Hero-side collapsible panel — same 0fr↔1fr trick as
     .dep-row-detail so the trail animates to intrinsic height. The
     entry itself reuses the same .stops-ahead inner styling. */
  .hero-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
  }
  .hero-detail-inner {
    overflow: hidden;
    min-height: 0;
  }
  .hero-detail.expanded {
    grid-template-rows: 1fr;
  }
  .hero-direction {
    font-weight: 500;
    color: var(--primary-text-color);
    /* Single-line ellipsis. Long Wiener Linien direction names like
       "Floridsdorf, U-Bahn-Station" otherwise wrap onto a 2nd or 3rd
       line and inflate the hero's vertical footprint. min-width: 0 is
       required for text-overflow: ellipsis to work inside flex. */
    flex: 1 1 0;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hero-platform {
    font-size: var(--ha-font-size-xs, 0.75rem);
    font-weight: 500;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--primary-text-color) 10%,
      transparent
    );
  }
  /* Hero accessibility flag — small icon-only pill in the same slot
     the rt-pill used to occupy. Only rendered when the next departure
     is barrier-free AND the user has show_accessibility enabled. */
  .hero-a11y {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: var(--wl-info);
    padding: 2px 6px;
    border-radius: 999px;
    flex-shrink: 0;
    forced-color-adjust: none;
  }
  .hero-a11y ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Version banner — accent surface that uses warning tokens. The
     button is rendered bare by renderVersionBanner (shared-render.ts);
     the .banner > button selector below tints it to match. */
  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-warning) 16%, transparent);
    color: var(--primary-text-color);
    font-size: 0.85rem;
  }
  .banner > span {
    flex: 1;
  }
  .banner > button {
    height: 32px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: var(--wl-warning);
    color: var(--text-primary-color, #fff);
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px color-mix(in srgb, #000 12%, transparent);
    transition: filter var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease), transform 0.06s ease;
    forced-color-adjust: none;
  }
  .banner > button:hover {
    filter: brightness(1.08);
  }
  .banner > button:active {
    transform: translateY(1px);
  }

  /* Alerts: traffic + elevator items use the same expandable surface. */
  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .alert {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: var(--wl-radius-md);
    background: color-mix(in srgb, var(--wl-warning) 12%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--wl-warning) 22%, transparent);
    font-size: 0.85rem;
    cursor: pointer;
    user-select: none;
    forced-color-adjust: none;
  }
  .alert.no-detail {
    cursor: default;
  }
  .alert > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--wl-warning);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .alert-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }
  .alert-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
  }
  .alert-title {
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .alert-lines {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .alert-line-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    background: var(--primary-color);
    forced-color-adjust: none;
  }
  /* Modern reveal: 0fr ↔ 1fr animates to intrinsic height without
     clipping multi-line traffic descriptions. */
  .alert-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
  }
  .alert-detail > .alert-detail-inner {
    overflow: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .alert.expanded .alert-detail {
    grid-template-rows: 1fr;
  }
  .alert-desc {
    color: var(--secondary-text-color);
    line-height: 1.4;
  }
  .alert-meta {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    color: var(--secondary-text-color);
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
  }
  .alert-location-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .alert-location-chip ha-icon {
    --mdc-icon-size: 14px;
    color: var(--secondary-text-color);
  }
  .alert-chevron {
    margin-left: auto;
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    transition: transform var(--ha-transition-duration-fast, 160ms) var(--ha-transition-easing-standard, ease);
    flex-shrink: 0;
  }
  .alert.expanded .alert-chevron {
    transform: rotate(180deg);
  }

  /* Departure rows: rack-style repeated unit. Soft accent surface so the
     section reads as a single coherent block rather than a row of
     dividers. */
  .dep-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .dep-row {
    display: grid;
    grid-template-columns: max-content 1fr auto auto auto;
    align-items: center;
    gap: 8px;
    padding: 6px 2px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    transition: background-color
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .dep-row:last-child {
    border-bottom: none;
  }
  /* Soft tint on hover so brushing the cursor across the list reads
     as interactive without flashing. Mirrors the Linz card. The
     prefers-reduced-motion block at the bottom of this stylesheet
     neutralises the transition for users who opt out. */
  .dep-row:hover {
    background: color-mix(
      in srgb,
      var(--primary-text-color) 4%,
      transparent
    );
  }
  /* When the row carries a stops_ahead panel, the entire row becomes a
     button-like surface. Cursor and user-select cues mirror the alert
     pattern (.alert) so the affordance is consistent across the card. */
  .dep-row.expandable {
    cursor: pointer;
    user-select: none;
  }
  .row-chevron {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
    flex-shrink: 0;
    transition: transform
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .dep-row.expanded .row-chevron {
    transform: rotate(180deg);
  }
  /* Detail panel: sibling <li> rendered immediately below an expandable
     .dep-row. The 0fr ↔ 1fr trick mirrors .alert-detail and animates to
     intrinsic height so the stop list never clips. The panel is always
     in the DOM (inside aria-hidden) so screen readers can step into it
     when expanded; collapse just zeroes the row track. */
  .dep-row-detail {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.24s ease;
    list-style: none;
  }
  .dep-row-detail-inner {
    overflow: hidden;
    min-height: 0;
  }
  .dep-row-detail.expanded {
    grid-template-rows: 1fr;
  }
  /* Metro-map style trail: a vertical line in the line's brand colour
     with one filled dot per stop. Indent matches the row's line-badge
     (min-width 2.4em) + gap (8px) so the line visually descends from
     under the badge. The connecting line is drawn as a 3px-wide pseudo-
     element under the dot column; dots overlap it so they appear "on"
     the line. The terminus stop highlights with a hollow ring + bold
     name to anchor the destination. */
  .stops-ahead {
    --stops-ahead-line: var(--primary-color);
    --stops-ahead-dot-size: 10px;
    --stops-ahead-line-width: 2px;
    list-style: none;
    margin: 0;
    padding: 8px 10px 10px calc(2.4em + 8px);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--secondary-text-color);
    font-size: 0.85rem;
    line-height: 1.3;
  }
  /* The vertical line. Sits behind the dots (they have higher z-index)
     and stops at the centre of the first/last dot via a clip on the
     containing list — easiest done by pinning top/bottom to half the
     dot size. */
  .stops-ahead::before {
    content: "";
    position: absolute;
    left: calc(2.4em + 8px + var(--stops-ahead-dot-size) / 2 - var(--stops-ahead-line-width) / 2);
    top: calc(8px + var(--stops-ahead-dot-size) / 2);
    bottom: calc(10px + var(--stops-ahead-dot-size) / 2);
    width: var(--stops-ahead-line-width);
    background: var(--stops-ahead-line);
    border-radius: 2px;
  }
  .stops-ahead-stop {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: calc(var(--stops-ahead-dot-size) + 10px);
    min-height: var(--stops-ahead-dot-size);
  }
  .stops-ahead-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: var(--stops-ahead-dot-size);
  }
  .stops-ahead-dot {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: var(--stops-ahead-dot-size);
    height: var(--stops-ahead-dot-size);
    border-radius: 50%;
    background: var(--stops-ahead-line);
    z-index: 1;
    forced-color-adjust: none;
  }
  .stops-ahead-name {
    color: var(--primary-text-color);
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stops-ahead-stop.terminus .stops-ahead-name {
    font-weight: 600;
  }
  .stops-ahead-stop.terminus .stops-ahead-dot {
    /* Hollow ring at the terminus, anchoring "this is where you end up". */
    background: var(--card-background-color, var(--ha-card-background, #fff));
    box-shadow: inset 0 0 0 var(--stops-ahead-line-width) var(--stops-ahead-line);
  }
  /* Transfer-line chips: small pill badges. U-Bahn chips sit inline
     immediately after the station name (always visible, brand-coloured).
     Tram/bus/night transfers sit behind the right-aligned toggle button
     ("+N" with a chevron) and wrap to a second row inside the same
     stop entry when expanded. */
  .stops-ahead-metros {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    flex-shrink: 0;
  }
  .stops-ahead-line-chip {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    background: var(--primary-color);
    line-height: 1.4;
    forced-color-adjust: none;
  }
  /* "+N ▾" toggle button: pill-shaped, neutral background, chevron
     rotates when the non-metro chip group below is expanded. Pinned
     to the right via margin-left:auto. */
  .stops-ahead-other-toggle {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 4px 1px 6px;
    border: 0;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--secondary-text-color) 14%,
      transparent
    );
    color: var(--secondary-text-color);
    font-size: 0.7rem;
    font-weight: var(--ha-font-weight-bold, 600);
    cursor: pointer;
    flex-shrink: 0;
    line-height: 1.4;
  }
  .stops-ahead-other-toggle ha-icon {
    --mdc-icon-size: 14px;
    transition: transform
      var(--ha-transition-duration-fast, 160ms)
      var(--ha-transition-easing-standard, ease);
  }
  .stops-ahead-stop.transfers-expanded .stops-ahead-other-toggle ha-icon {
    transform: rotate(180deg);
  }
  /* Second-row container for non-metro chips. Wraps freely; sits below
     the station-name row so its width never pushes the layout. */
  .stops-ahead-others {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
  }
  /* Non-metro chips render slightly lighter so the inline U-Bahn chips
     stay the dominant signal. */
  .stops-ahead-line-chip--other {
    opacity: 0.92;
  }
  .line-badge {
    text-align: center;
    font-weight: var(--ha-font-weight-bold, 600);
    color: #fff;
    border-radius: 6px;
    padding: 3px 8px;
    min-width: 2.4em;
    font-size: 0.85rem;
    background: var(--primary-color);
    box-shadow: inset 0 -2px 0 color-mix(in srgb, #000 18%, transparent);
    forced-color-adjust: none;
  }
  .towards {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
  }
  .type-icon {
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    margin-right: 4px;
    vertical-align: 1px;
  }
  .delay {
    color: var(--wl-warning);
    font-size: 0.85rem;
    font-weight: 500;
    margin-left: 4px;
  }
  /* Trailing column container — holds the optional platform pill and
     the optional flags icons in one grid cell. Inline-flex so platform
     sits left of flags (and thus left of the wheelchair icon, per the
     portfolio convention). */
  .row-end {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  /* Platform pill — small, muted, monospace digits so "Steig 7" /
     "Gleis 12" line up visually across rows. Same shape as Linz's
     .row-platform with the wiener-namespace tokens. */
  .row-platform {
    font-size: var(--ha-font-size-xs, 0.7rem);
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    padding: 1px 6px;
    border-radius: 4px;
    background: color-mix(
      in srgb,
      var(--secondary-text-color) 12%,
      transparent
    );
  }
  .row-flags {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
  }
  .row-flags ha-icon {
    --mdc-icon-size: 16px;
  }
  .row-flags .disturbance {
    color: var(--wl-warning);
  }
  .countdown {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    min-width: 50px;
    text-align: right;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  /* State colours — Linz parity. now / late / early class lights up
     the countdown so the user catches the schedule deviation at a
     glance without parsing the delay text. The Wiener Linien API does
     not expose a realtime-vs-scheduled distinction, so the live-pulse
     dot Linz uses isn't applicable here — countdowns are coloured
     purely by their delay state. */
  .countdown.now   { color: var(--wl-accent); }
  .countdown.late  { color: var(--wl-error); }
  .countdown.early { color: var(--wl-info); }

  /* Empty / fallback states */
  .empty {
    padding: 18px 0;
    color: var(--secondary-text-color);
    text-align: center;
    font-size: 0.85rem;
  }

  /* Footer: attribution timestamp / etc. Right-pin via margin-left:auto.
     Padding + margin mirror linz-linien-austria so a stacked dashboard
     reads as one visual family. Linz uses margin: 0 var(--linz-pad-x)
     plus padding: 8px 0 because its .foot is a direct <ha-card> child
     with no wrapper to provide outer inset. Wiener's .foot lives
     inside .wrap (which already pads horizontally), so the equivalent
     here is padding: 8px 0 with no extra horizontal margin — divider
     line ends up at the same horizontal inset as the row content
     above. (No backticks in this comment — the whole stylesheet is a
     css tagged template, an inner backtick terminates the literal.) */
  .foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    /* Eat .wrap's flex gap above and bottom padding below, so .foot
       butts up against the last row's bottom edge AND bottoms-out at
       the card edge — matching linz-linien (where .foot is a direct
       ha-card child with no gap above and no padding below). Without
       margin-top, .wrap's --wl-row-gap pushes the divider 12px below
       the last row; without margin-bottom, the timestamp sits 8px +
       --wl-pad-y above the card edge instead of being vertically
       centred between divider and edge. */
    margin-top: calc(-1 * var(--wl-row-gap));
    margin-bottom: calc(-1 * var(--wl-pad-y));
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .timestamp {
    margin-left: auto;
  }

  /* Dev-mode strip — visible only on rpi25 / ?wl_debug=1 */
  .dev-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px dashed var(--secondary-text-color, rgba(0, 0, 0, 0.3));
    border-radius: var(--wl-radius-sm);
    font-size: 0.7rem;
    color: var(--secondary-text-color);
  }
  .dev-strip-label {
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .dev-strip button {
    padding: 4px 10px;
    border-radius: var(--wl-radius-sm);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
    background: transparent;
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: 0.78rem;
    cursor: pointer;
  }
  .dev-strip button:hover {
    opacity: 0.8;
  }
  .dev-strip .dev-strip-clear {
    margin-left: auto;
    color: var(--secondary-text-color);
  }

  /* Container density ladder. One token tweak per breakpoint cascades
     through every component above. */
  @container wlcard (inline-size < 360px) {
    :host {
      --wl-pad-x: 12px;
      --wl-pad-y: 12px;
      --wl-tile-size: 36px;
      --wl-slot-min-h: 40px;
      --wl-metric-size: 2rem;
    }
    .tabs {
      padding: 0 8px;
    }
    .tab {
      padding: 0 8px;
      font-size: 0.8125rem;
    }
    .towards {
      white-space: normal;
    }
  }

  @container wlcard (inline-size > 480px) {
    :host {
      --wl-pad-x: 20px;
      --wl-pad-y: 16px;
      --wl-tile-size: 44px;
      --wl-metric-size: 2.5rem;
    }
    .icon-tile ha-icon {
      --mdc-icon-size: 24px;
    }
  }

  /* Accessibility primitives — verbatim from the project spec. */
  .tab:focus-visible,
  .alert:focus-visible,
  .dep-row.expandable:focus-visible,
  .hero-entry.expandable:focus-visible,
  .stops-ahead-other-toggle:focus-visible,
  .icon-action:focus-visible,
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 6px;
  }
  @media (forced-colors: active) {
    .icon-tile,
    .line-badge,
    .alert,
    .dep-row {
      forced-color-adjust: none;
      outline: 1px solid CanvasText;
    }
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
  }
`,Ae="1.4.0",Se="#1b1464";var Ee={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",delay_singular:"1 Minute verspätet",delay_plural:"{n} Minuten verspätet",devmode_title:"DEV",devmode_traffic_btn:"Test Störung",devmode_elevator_btn:"Test Aufzug",devmode_clear_btn:"Löschen",editor:{lines_label:"Linien",direction_label:"Richtung",per_line_direction_label:"Richtung pro Linie",per_line_direction_hint:"Optional: Richtung pro Linie einzeln festlegen. Beide = haltestellenweite Richtung oben verwenden.",per_line_direction_aria:"Richtung für Linie {line}",direction_unavailable:"Keine Abfahrten in dieser Richtung",walk_time_label:"Fußweg (min)",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",section_colors:"Linienfarben",colors_hint:"Optional: Farben überschreiben. U-Bahn-Standardwerte sind gesetzt.",reset_color:"Zurücksetzen",pick_color_for_line:"Farbe für Linie {line} wählen",section_display:"Anzeige",max_departures:"Anzahl Abfahrten pro Haltestelle",show_accessibility:"Barrierefrei-Symbol anzeigen",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen",show_platform:"Steig/Gleis anzeigen",show_traffic_info:"Störungen anzeigen",show_elevator_info:"Aufzugsinfo anzeigen",show_delay:"Verspätungen anzeigen",show_hero_metric:"Hauptbereich anzeigen",show_departures:"Abfahrtsliste anzeigen",show_stops_ahead:"Zwischenstopps anzeigen",hide_header:"Kopfzeile ausblenden",hide_attribution:"Datenquelle ausblenden",layout:"Layout mehrerer Haltestellen",layout_stacked:"Gestapelt",layout_tabs:"Reiter",no_lines_available:"Linien erscheinen hier, sobald Haltestellen ausgewählt wurden."}},ze={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",barrier_free_title:"Barrierefrei zugänglich",editor:{direction:"Richtung",line:"Linie",size:"Größe",style:"Stil",station_bg:"Hintergrund",section_display:"Darstellung",section_walk_time:"Fußweg zur Haltestelle",walk_time_hint:"Abfahrten ausblenden, die bereits weg wären, bis du dort bist. Leer lassen = kein Filter.",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_no_data:"Keine Abfahrten in dieser Richtung. Richtung wechseln oder warten, bis der Sensor Linien meldet.",walk_time_placeholder:"–",walk_time_aria:"Fußweg in Minuten für Linie {line} Richtung {towards}",show_platform:"Gleis/Steig anzeigen",show_station_name:"Stationsnamen anzeigen",section_station:"Stationsnamen-Schild",station_bg_default:"Standard",station_bg_white:"Weiß",station_bg_black:"Schwarz",size_small:"Klein",size_medium:"Mittel",size_regular:"Normal",style_classic:"Klassisch",style_warm:"Warm",style_pixel:"Punktmatrix",accessibility_only:"Nur barrierefreie Abfahrten anzeigen",flicker:"Linien-Flimmern",wheelchair_race:"Rollstuhl-Rennen"}},Te={modern:Ee,retro:ze},Ce={no_data:"No departures available",betriebsschluss:"End of service",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",delay_singular:"1 minute late",delay_plural:"{n} minutes late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_clear_btn:"Clear",editor:{lines_label:"Lines",direction_label:"Direction",per_line_direction_label:"Per-line direction",per_line_direction_hint:"Optional: pick the direction for each line individually. Both = use the stop-wide direction above.",per_line_direction_aria:"Direction for line {line}",direction_unavailable:"No departures in this direction",walk_time_label:"Walking time (min)",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",section_colors:"Line colours",colors_hint:"Optional overrides. Metro defaults are already set.",reset_color:"Reset",pick_color_for_line:"Pick colour for line {line}",section_display:"Display",max_departures:"Departures per stop",show_accessibility:"Show step-free icon",accessibility_only:"Only show step-free departures",show_type_icon:"Show vehicle-type icon",show_platform:"Show platform / track",show_traffic_info:"Show disruption alerts",show_elevator_info:"Show elevator outages",show_delay:"Show delays",show_hero_metric:"Show hero block",show_departures:"Show departure list",show_stops_ahead:"Show intermediate stops",hide_header:"Hide header",hide_attribution:"Hide data source",layout:"Multi-stop layout",layout_stacked:"Stacked",layout_tabs:"Tabs",no_lines_available:"Lines appear here once stops are selected."}},Re={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"PLATF.",steig:"STAND",version_update:"Retro card updated to v{v} — please reload",version_reload:"Reload",departures_list:"Upcoming departures",at_platform:"At platform",countdown_minutes:"{n} minutes",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",barrier_free_title:"Step-free access",editor:{direction:"Direction",line:"Line",size:"Size",style:"Style",station_bg:"Station-name background",section_display:"Display",section_walk_time:"Walking time to stop",walk_time_hint:"Hide departures that would already be gone by the time you reach the platform. Leave blank for no filter.",walk_time_branching_hint:"Applies to all termini in this direction",walk_time_no_data:"No departures in this direction. Switch direction or wait until the sensor reports lines.",walk_time_placeholder:"–",walk_time_aria:"Walk time in minutes for line {line} towards {towards}",show_platform:"Show platform",show_station_name:"Show station name",section_station:"Station name sign",station_bg_default:"Default",station_bg_white:"White",station_bg_black:"Black",size_small:"Small",size_medium:"Medium",size_regular:"Regular",style_classic:"Classic",style_warm:"Warm",style_pixel:"Dot matrix",accessibility_only:"Only show step-free departures",flicker:"Line badge flicker",wheelchair_race:"Wheelchair race"}},He={modern:Ce,retro:Re};const Le={de:Object.freeze({__proto__:null,default:Te,modern:Ee,retro:ze}),en:Object.freeze({__proto__:null,default:He,modern:Ce,retro:Re})},De=Le.de??{};function Ne(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Me(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").replace("-","_").split("_")[0]??"de")?"en":"de"}(t);let n=Ne(e,Le[r]??De);if(void 0===n&&(n=Ne(e,De)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Pe(){try{window.caches?.keys?.().then(e=>{e.forEach(e=>window.caches?.delete?.(e))})}catch{}window.location.reload()}function Oe(e,t,i="banner"){if(!e)return K;const r=t("version_update").replace("{v}",e),n=t("version_reload");return F`
    <div class=${i} role="alert" aria-live="assertive">
      <span>${r}</span>
      <button
        type="button"
        aria-label=${n}
        @click=${Pe}
      >
        ${n}
      </button>
    </div>
  `}const Ue="ptMetro";function je(e){switch(e){case Ue:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}function Be(e){if("string"==typeof e)return e.startsWith("sensor.")?{entity:e}:null;if(!e||"object"!=typeof e)return null;const t=e,i="string"==typeof t.entity?t.entity:null;if(!i?.startsWith("sensor."))return null;const r={entity:i};if(Array.isArray(t.lines)){const e=t.lines.filter(e=>"string"==typeof e&&e.length>0);e.length&&(r.lines=e)}"H"!==t.direction&&"R"!==t.direction||(r.direction=t.direction);const n=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e))"string"==typeof i&&i.length&&("H"!==r&&"R"!==r||(t[i]=r));return Object.keys(t).length?t:void 0}(t.line_directions);n&&(r.line_directions=n);const s=function(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e))continue;if(e<0||e>120)continue;const n=i.split("|"),s=n.length>=3?`${n[0]}|${n[1]}`:i,a=Math.round(e),o=t[s];t[s]=void 0===o?a:Math.max(o,a)}return Object.keys(t).length?t:void 0}(t.walk_times);return s&&(r.walk_times=s),r}const We=6,Fe=!1,Ie=!1,Ke=!0,Ge=!0,Ve=!0,qe=!1,Ze=!0,Ye=!0,Je=!0,Qe=!0,Xe=!1,et=!1;function tt(e){let t=[];Array.isArray(e.entities)?t=e.entities:"string"==typeof e.entity&&(t=[{entity:e.entity,lines:e.lines,direction:e.direction,walk_times:e.walk_times}]);const i=[],r=new Set;for(const e of t){const t=Be(e);t&&(r.has(t.entity)||(r.add(t.entity),i.push(t)))}const n=Number(e.max_departures),s=Number.isFinite(n)?Math.max(0,Math.min(20,Math.round(n))):We,a={};if(e.line_colors&&"object"==typeof e.line_colors)for(const[t,i]of Object.entries(e.line_colors))"string"==typeof i&&/^#[0-9A-Fa-f]{3,8}$/.test(i.trim())&&(a[t.toUpperCase()]=i.trim());return{...e,type:e.type||"custom:wiener-linien-austria-card",entities:i,max_departures:s,line_colors:a,show_accessibility:e.show_accessibility??Fe,accessibility_only:e.accessibility_only??Ie,show_traffic_info:e.show_traffic_info??Ke,show_elevator_info:e.show_elevator_info??Ge,show_delay:e.show_delay??Ve,show_type_icon:e.show_type_icon??qe,show_platform:e.show_platform??Ze,show_hero_metric:e.show_hero_metric??Ye,show_departures:e.show_departures??Je,show_stops_ahead:e.show_stops_ahead??Qe,hide_header:e.hide_header??Xe,hide_attribution:e.hide_attribution??et,layout:"tabs"===e.layout?"tabs":"stacked"}}function it(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return t[n];if(/^N\d/.test(n))return Se;const s=i[e]??i[n];return s?.bg?`#${s.bg}`:r}function rt(e,t,i={}){const r=e.toUpperCase();if(void 0!==t[r])return{background:t[r]};if(/^N\d/.test(r))return{background:Se,color:"#fef200"};const n=i[e]??i[r];return n?.bg?n.fg?{background:`#${n.bg}`,color:`#${n.fg}`}:{background:`#${n.bg}`}:{background:"var(--primary-color)"}}function nt(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};if("number"!=typeof e.diva)continue;if(!Array.isArray(e.departures))continue;(e.attribution??"").toLowerCase().includes("wiener linien")&&t.push(i)}return t.sort(),t}function st(e,t,i){return`${e}|${t}|${i}`}function at(e,t){return`${e}|${t}`}function ot(e){const t=new Set;for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}function lt(e){return function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}(e).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}function dt(e,t="de"){if(!e)return"";const i=Date.parse(e);if(!Number.isFinite(i))return e;try{return new Date(i).toLocaleString("en"===t?"en-GB":"de-AT",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch{return e}}const ct=a`
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
`;
// Schema-driven Lovelace editor for the Wiener Linien Austria modern card.
let ht=class extends oe{constructor(){super(...arguments),this._computeLabel=e=>{const t=`ui.panel.lovelace.editor.card.generic.${e.name}`,i=this.hass?.localize?.(t);if(i)return i;const r=this._et(e.name);return r!==`modern.editor.${e.name}`&&r!==e.name?r:e.name},this._computeHelper=e=>{const t=`${e.name}_helper`,i=this._et(t);if(i!==`modern.editor.${t}`&&i!==t)return i},this._onFormChanged=e=>{if(!this._config)return;const t=e.detail.value,i=t.entities,r=Array.isArray(i)?i.filter(e=>"string"==typeof e&&e.length>0):[],n=new Map;for(const e of this._config.entities)n.set(e.entity,e);const s=r.map(e=>n.get(e)??{entity:e}),a=tt({...this._config,...t,entities:s});this._fire(a)}}setConfig(e){this._config=tt(e)}_et(e){return Me(`modern.editor.${e}`,{hassLanguage:this.hass?.language})}_t(e){return Me(`modern.${e}`,{hassLanguage:this.hass?.language})}_fire(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_schema(){return[{name:"entities",required:!0,selector:{entity:{domain:"sensor",integration:"wiener_linien_austria",multiple:!0}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"stacked",label:this._et("layout_stacked")},{value:"tabs",label:this._et("layout_tabs")}]}}},{type:"expandable",name:"display",title:this._et("section_display"),flatten:!0,schema:[{name:"max_departures",selector:{number:{min:0,max:20,step:1,mode:"slider"}}},{name:"hide_header",selector:{boolean:{}}},{name:"show_hero_metric",selector:{boolean:{}}},{name:"show_departures",selector:{boolean:{}}},{name:"show_stops_ahead",selector:{boolean:{}}},{name:"show_platform",selector:{boolean:{}}},{name:"show_accessibility",selector:{boolean:{}}},{name:"accessibility_only",selector:{boolean:{}}},{name:"show_type_icon",selector:{boolean:{}}},{name:"show_traffic_info",selector:{boolean:{}}},{name:"show_elevator_info",selector:{boolean:{}}},{name:"show_delay",selector:{boolean:{}}},{name:"hide_attribution",selector:{boolean:{}}}]}]}_formData(){if(!this._config)return{};const e=this._config.entities.map(e=>e.entity);return{...this._config,entities:e}}_updateStop(e,t){if(!this._config)return;const i=this._config.entities.map(i=>i.entity===e?t({...i}):i);this._fire({...this._config,entities:i})}_toggleLine(e,t){this._updateStop(e,e=>{const i=new Set(e.lines??[]);return i.has(t)?i.delete(t):i.add(t),i.size>0?e.lines=[...i]:delete e.lines,e})}_setDirection(e,t){this._updateStop(e,e=>(null===t?delete e.direction:e.direction=t,e))}_setLineDirection(e,t,i){this._updateStop(e,e=>{const r={...e.line_directions??{}};return null===i?delete r[t]:r[t]=i,Object.keys(r).length?e.line_directions=r:delete e.line_directions,e})}_setWalkTime(e,t,i){const r=parseInt(i,10),n=Number.isFinite(r)&&r>0?Math.min(120,r):null;this._updateStop(e,e=>{const i={...e.walk_times??{}};return null===n?delete i[t]:i[t]=n,Object.keys(i).length?e.walk_times=i:delete e.walk_times,e})}_setLineColor(e,t){if(!this._config)return;const i={...this._config.line_colors,[e.toUpperCase()]:t};this._fire({...this._config,line_colors:i})}_resetLineColor(e){if(!this._config)return;const t={...this._config.line_colors};delete t[e.toUpperCase()],this._fire({...this._config,line_colors:t})}_swallowKeys(e){e.stopPropagation()}_attrs(e){return this.hass?.states?.[e]?.attributes}render(){return this._config?F`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData()}
          .schema=${this._schema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._onFormChanged}
        ></ha-form>
        ${this._renderPerStopSections()}
        ${this._renderColorsSection()}
      </div>
    `:K}_renderPerStopSections(){const e=this._config;return e.entities.length?F`${e.entities.map(e=>this._renderStopFilter(e))}`:K}_directionLabelFromTermini(e,t){if(!t.length)return this._t("H"===e?"dir_h":"dir_r");return`${this._t("H"===e?"dir_h_short":"dir_r_short")}: ${t.slice(0,3).join(" / ")}${t.length>3?" +"+(t.length-3):""}`}_stopWideDirectionLabel(e,t){const i=new Set;for(const r of e)r.direction===t&&r.towards&&i.add(r.towards);return this._directionLabelFromTermini(t,[...i].sort())}_perLineDirectionLabel(e,t,i){const r=new Set;for(const n of e)n.line===t&&n.direction===i&&n.towards&&r.add(n.towards);return this._directionLabelFromTermini(i,[...r].sort())}_renderStopFilter(e){const t=this._attrs(e.entity);if(!t)return F``;const i=t.stop_name||e.entity,r=this._config.line_colors,n=t.line_colors??{},s=[...new Set((t.departures??[]).map(e=>e.line).filter(e=>!!e))].sort(),a=new Set(e.lines??[]),o=e.direction??null,l=e.line_directions??{},d=a.size>0?s.filter(e=>a.has(e)):s,c=d.length>=2,h=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=st(r.line,String(r.direction??""),r.towards);i.has(e)||(i.add(e),t.push({line:r.line,direction:String(r.direction??""),towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(t),p=h.filter(e=>{if(a.size>0&&!a.has(e.line))return!1;const t=l[e.line]??o;return!t||e.direction===t}),u=new Set;for(const e of h)"H"!==e.direction&&"R"!==e.direction||u.add(e.direction);const _=u.has("H"),f=u.has("R"),g=1===u.size,m="H"===o||null===o&&g&&_,b="R"===o||null===o&&g&&f,w=null===o&&!g;return F`
      <div class="stop-filter">
        <div class="stop-filter-header">${i}</div>

        <div class="stop-filter-row">
          <div class="stop-filter-row-label">${this._et("lines_label")}</div>
          <div class="line-chips">
            ${s.length?s.map(t=>{const i=0===a.size||a.has(t),s=it(t,r,n),o=i?{background:s,borderColor:s,color:"#fff"}:{};return F`<button
                    type="button"
                    class=${ve({chip:!0,selected:i})}
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
              class=${ve({active:m})}
              ?disabled=${!_}
              title=${_?"":this._et("direction_unavailable")}
              @click=${()=>_&&this._setDirection(e.entity,"H")}
            >${this._stopWideDirectionLabel(h,"H")}</button>
            <button
              type="button"
              class=${ve({active:b})}
              ?disabled=${!f}
              title=${f?"":this._et("direction_unavailable")}
              @click=${()=>f&&this._setDirection(e.entity,"R")}
            >${this._stopWideDirectionLabel(h,"R")}</button>
            <button
              type="button"
              class=${ve({active:w})}
              ?disabled=${g}
              title=${g?this._et("direction_unavailable"):""}
              @click=${()=>!g&&this._setDirection(e.entity,null)}
            >${this._t("dir_both")}</button>
          </div>
        </div>

        ${c?F`
              <div class="stop-filter-row">
                <div class="stop-filter-row-label">${this._et("per_line_direction_label")}</div>
                <div class="editor-hint">${this._et("per_line_direction_hint")}</div>
                <div class="per-line-dir-list">
                  ${d.map(t=>{const i=it(t,r,n),s=l[t]??null,a=(e=>{const t=new Set;for(const i of h)i.line===e&&("H"!==i.direction&&"R"!==i.direction||t.add(i.direction));return t})(t),o=a.has("H"),d=a.has("R"),c=1===a.size,p="H"===s||null===s&&c&&o,u="R"===s||null===s&&c&&d,_=null===s&&!c,f=this._et("per_line_direction_aria").replace("{line}",t),g=this._et("direction_unavailable"),m=e=>this._perLineDirectionLabel(h,t,e);return F`
                      <div class="per-line-dir-row" role="group" aria-label=${f}>
                        <span class="per-line-dir-badge" style=${xe({background:i})}>${t}</span>
                        <div class="direction-buttons">
                          <button
                            type="button"
                            class=${ve({active:p})}
                            aria-pressed=${p?"true":"false"}
                            ?disabled=${!o}
                            title=${o?"":g}
                            @click=${()=>o&&this._setLineDirection(e.entity,t,"H")}
                          >${m("H")}</button>
                          <button
                            type="button"
                            class=${ve({active:u})}
                            aria-pressed=${u?"true":"false"}
                            ?disabled=${!d}
                            title=${d?"":g}
                            @click=${()=>d&&this._setLineDirection(e.entity,t,"R")}
                          >${m("R")}</button>
                          <button
                            type="button"
                            class=${ve({active:_})}
                            aria-pressed=${_?"true":"false"}
                            ?disabled=${c}
                            title=${c?g:""}
                            @click=${()=>!c&&this._setLineDirection(e.entity,t,null)}
                          >${this._t("dir_both")}</button>
                        </div>
                      </div>
                    `})}
                </div>
              </div>
            `:K}

        ${this._renderWalkTimes(e,p,o,l)}
      </div>
    `}_renderWalkTimes(e,t,i,r){const n=this._config.line_colors,s=this._attrs(e.entity),a=s?.line_colors??{},o=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=at(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(s),l=new Set(e.lines??[]),d=o.filter(e=>{if(l.size>0&&!l.has(e.line))return!1;const t=r[e.line]??i;return!t||e.direction===t});return d.length?F`
      <div class="stop-filter-row">
        <div class="stop-filter-row-label">${this._et("walk_time_label")}</div>
        <div class="editor-hint">${this._et("walk_time_hint")}</div>
        <div class="walk-time-list">
          ${d.map(t=>{const i=it(t.line,n,a),r=at(t.line,t.direction),s=e.walk_times?.[r],o=t.termini.join(" / "),l=o?`→ ${o}`:"",d=t.termini.length>1?this._et("walk_time_branching_hint"):"";return F`
              <div class="walk-time-row">
                <span class="walk-time-badge" style=${xe({background:i})}>${t.line}</span>
                <span class="walk-time-towards" title=${d||o}>${l}</span>
                <input
                  type="number"
                  class="walk-time-input"
                  min="0"
                  max="120"
                  step="1"
                  inputmode="numeric"
                  placeholder=${this._et("walk_time_placeholder")}
                  aria-label=${this._et("walk_time_aria").replace("{line}",t.line).replace("{towards}",o)}
                  .value=${void 0!==s?String(s):""}
                  @keydown=${this._swallowKeys}
                  @keyup=${this._swallowKeys}
                  @keypress=${this._swallowKeys}
                  @change=${t=>this._setWalkTime(e.entity,r,t.target.value)}
                />
              </div>
            `})}
        </div>
      </div>
    `:K}_renderColorsSection(){const e=this._config,t=function(e,t){const i=new Set;for(const r of t){const t=e?.states?.[r]?.attributes;for(const e of ot(t))i.add(e)}return Array.from(i).sort()}(this.hass,e.entities.map(e=>e.entity)),i=e.line_colors;let r={};for(const t of e.entities){const e=this.hass?.states?.[t.entity]?.attributes;if(e?.line_colors&&Object.keys(e.line_colors).length){r=e.line_colors;break}}return F`
      <div class="editor-section">
        <div class="section-header">${this._et("section_colors")}</div>
        <div class="editor-hint">${this._et("colors_hint")}</div>
        ${t.length?t.map(e=>{const t=it(e,i,r,"#888888"),n=t.startsWith("#")?t:"#888888",s=Boolean(i[e.toUpperCase()]),a=this._et("pick_color_for_line").replace("{line}",e);return F`
                <div class="color-row">
                  <span class="line-preview" aria-hidden="true" style=${xe({background:t})}>${e}</span>
                  <label
                    class="color-swatch"
                    style=${`--swatch-color: ${n};`}
                    title=${a}
                  >
                    <ha-icon icon="mdi:palette-swatch-variant" aria-hidden="true"></ha-icon>
                    <span class="color-swatch-hex">${n.toUpperCase()}</span>
                    <input
                      type="color"
                      class="color-swatch-input"
                      .value=${n}
                      aria-label=${a}
                      @input=${t=>this._setLineColor(e,t.target.value)}
                      @change=${t=>this._setLineColor(e,t.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    class="reset-btn"
                    ?disabled=${!s}
                    @click=${()=>s&&this._resetLineColor(e)}
                  >${this._et("reset_color")}</button>
                </div>
              `}):F`<div class="editor-hint">${this._et("no_lines_available")}</div>`}
      </div>
    `}static{this.styles=[ct,a`
    .stop-filter {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .stop-filter-header {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .stop-filter-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stop-filter-row-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    .line-chips,
    .per-line-dir-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .per-line-dir-list {
      flex-direction: column;
      gap: 4px;
    }
    .per-line-dir-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .per-line-dir-badge {
      min-width: 36px;
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.8125rem;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      padding: 6px 12px;
      border-radius: 18px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
    }
    .chip:hover {
      opacity: 0.85;
    }
    .direction-buttons {
      display: inline-flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .direction-buttons button {
      padding: 8px 14px;
      border-radius: 18px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 0.8125rem;
      cursor: pointer;
      min-width: 44px;
      min-height: 36px;
    }
    .direction-buttons button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .direction-buttons button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    /* walk-time rules live in editor-shared-styles. The modern editor
       styles its badge bg per-line via styleMap (vs the shared default
       var(--primary-color)), but the box-model rules are identical. */
    .color-row {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      align-items: center;
      gap: 12px;
      margin-top: 6px;
    }
    .line-preview {
      text-align: center;
      font-weight: 700;
      color: #fff;
      border-radius: 6px;
      padding: 4px 6px;
      font-size: 0.8125rem;
    }
    .color-swatch {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, #fff);
      cursor: pointer;
    }
    .color-swatch::before {
      content: "";
      width: 16px;
      height: 16px;
      border-radius: 4px;
      background: var(--swatch-color, #888888);
    }
    .color-swatch-hex {
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
    }
    .color-swatch-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .reset-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
      font-size: 0.75rem;
      cursor: pointer;
    }
    .reset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `]}};function pt(e,t){return e?F`<span lang="de">${e}</span>`:t??""}function ut(e){return e===Ue?"platform_short_rail":"platform_short_bus"}function _t(e,t){if(!e||!t)return{};const i=e.states[t]?.attributes;return i?.line_colors??{}}e([pe({attribute:!1})],ht.prototype,"hass",void 0),e([ue()],ht.prototype,"_config",void 0),ht=e([de("wiener-linien-austria-card-editor")],ht),console.info(`%c WIENER-LINIEN-AUSTRIA-CARD %c ${Ae} `,"color: white; background: #E3000F; font-weight: 700;","color: #E3000F; background: white; font-weight: 700;"),window.customCards=window.customCards??[],window.customCards.push({type:"wiener-linien-austria-card",name:"Wiener Linien Austria",description:"Abfahrtsmonitor mit Störungen und Aufzugsinfo",preview:!0});let ft=class extends oe{constructor(){super(...arguments),this._activeTab=0,this._versionMismatch=null,this._expandedTraffic=new Set,this._expandedElevator=new Set,this._expandedRows=new Set,this._expandedTransfers=new Set,this._debugTraffic=[],this._debugElevator=[],this._versionCheckDone=!1,this._devTestTraffic=()=>{const e=this._resolveStops(),t=[];for(const i of e)for(const e of this._attrs(i.entity).departures??[])e.line&&e.towards&&t.push(e);const i=this._randomFrom(t),r=i?.line||"U?",n=i?.towards||"Unbekannt",s=new Date;this._debugTraffic=[...this._debugTraffic,{name:`DEBUG-T-${Date.now()}`,title:`${r}: Testmeldung`,description:`Debug-Eintrag für Linie ${r} Richtung ${n}.`,description_html:`Debug-Eintrag für Linie ${r} Richtung ${n}.<br><br>Grund: Dev-Mode-Test.`,location:"Debug-Stelle",related_lines:[r],time_start:new Date(s.getTime()-18e5).toISOString(),time_end:new Date(s.getTime()+108e5).toISOString(),time_created:new Date(s.getTime()-18e5).toISOString(),time_last_update:s.toISOString(),status:"active"}]},this._devTestElevator=()=>{const e=this._resolveStops(),t=this._randomFrom(e);if(!t)return;const i=this._attrs(t.entity),r=i.stop_name||t.entity,n=i.departures??[],s=this._randomFrom(n)?.line||"",a=this._randomFrom(n)?.towards||"Unbekannt",o=new Date;this._debugElevator=[...this._debugElevator,{__debug_entity:t.entity,name:`DEBUG-E-${Date.now()}`,station:r,description:`${s||"Station"} Bahnsteig Richtung ${a} — Ausgang ${r}`,reason:"AUFZUGSERNEUERUNG Voraussichtlich bis Ende Mai außer Betrieb! (Dev-Mode-Test)",status:"außer Betrieb",related_lines:s?[s]:[],time_start:new Date(o.getTime()-27e5).toISOString(),time_end:new Date(o.getTime()+144e5).toISOString()}]},this._devClear=()=>{this._debugTraffic=[],this._debugElevator=[]}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-card: config must be an object");const t=Array.isArray(e.entities),i="string"==typeof e.entity;if(!t&&!i)throw new Error("wiener-linien-austria-card: 'entities' (array) or legacy 'entity' (string) is required");this._config=tt(e)}getCardSize(){const e=this._config?.entities.length??1;return Math.min(12,3+3*e)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:3}}static getConfigElement(){return document.createElement("wiener-linien-austria-card-editor")}static getStubConfig(e){const t=nt(e);return{entities:t.length?[t[0]]:[],max_departures:6}}connectedCallback(){super.connectedCallback(),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion())}willUpdate(e){if(this._config&&(e.has("_config")||e.has("hass"))){const e=this._resolveStops();e.length&&this._activeTab>=e.length&&(this._activeTab=0)}}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_activeTab")||e.has("_versionMismatch")||e.has("_expandedTraffic")||e.has("_expandedElevator")||e.has("_expandedRows")||e.has("_expandedTransfers")||e.has("_debugTraffic")||e.has("_debugElevator"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveStops().map(e=>e.entity);return i.some(e=>t.states[e]!==this.hass.states[e])}_lang(){return this.hass?.language?.startsWith("de")?"de":"en"}_t(e,t){return Me(`modern.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/card_version",Ae)}_resolveStops(){const e=(this._config?.entities??[]).filter(e=>this.hass?.states?.[e.entity]);if(e.length)return e;const t=nt(this.hass)[0];return t?[{entity:t}]:[]}_attrs(e){return this.hass?.states?.[e]?.attributes??{}}render(){if(!this._config)return K;if(!this.hass)return F`<ha-card><div class="wrap"></div></ha-card>`;const e=this._config,t=this._resolveStops(),i="tabs"===e.layout&&t.length>=2,r=e.hide_attribution?"":t.map(e=>this._attrs(e.entity).attribution).find(e=>"string"==typeof e&&e.length>0)||"Datenquelle: Wiener Linien (data.wien.gv.at), CC BY 4.0";return F`
      <ha-card>
        ${i?this._renderTabs(t,this._activeTab):K}
        <div class="wrap">
          ${Oe(this._versionMismatch,e=>this._t(e))}
          ${e.show_traffic_info?this._renderTrafficBanner(t):K}
          ${this._renderBody(t,i)}
          ${this._renderFooter(r)}
        </div>
      </ha-card>
    `}_renderFooter(e){const t=this._isDevMode();return e||t?F`
      ${e?F`<div class="foot">
            <span class="timestamp">${e}</span>
          </div>`:K}
      ${t?this._renderDevModePanel():K}
    `:K}_renderBody(e,t){if(!e.length)return this._renderEmpty();if(t){const t=e[this._activeTab]??e[0];return F`${this._renderStop(t,this._activeTab)}`}return F`${e.map(e=>this._renderStop(e))}`}_renderEmpty(){const e=nt(this.hass).length?"no_entities_picked":"no_entities_available";return F`<div class="empty" role="status" aria-live="polite">${this._t(e)}</div>`}_renderTabs(e,t){return F`
      <div class="tabs" role="tablist">
        ${e.map((i,r)=>{const n=this._attrs(i.entity),s=n.stop_name||n.friendly_name||i.entity,a=r===t;return F`<button
            type="button"
            role="tab"
            id=${`wl-tab-${r}`}
            aria-controls=${`wl-tabpanel-${r}`}
            class=${ve({tab:!0,active:r===t})}
            aria-selected=${a?"true":"false"}
            tabindex=${a?"0":"-1"}
            @click=${()=>this._setActiveTab(r)}
            @keydown=${t=>this._onTabKeydown(t,r,e.length)}
          >${s}</button>`})}
      </div>
    `}_setActiveTab(e){Number.isFinite(e)&&e!==this._activeTab&&(this._activeTab=e)}_onTabKeydown(e,t,i){let r=t;switch(e.key){case"ArrowRight":r=(t+1)%i;break;case"ArrowLeft":r=(t-1+i)%i;break;case"Home":r=0;break;case"End":r=i-1;break;default:return}e.preventDefault(),this._setActiveTab(r),this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelectorAll('.tabs [role="tab"]');e?.[r]?.focus()})}_renderStop(e,t){const i=this._attrs(e.entity),r=i.stop_name||i.friendly_name,n=r||e.entity,s=function(e,t){const{lines:i,direction:r,line_directions:n,walk_times:s,accessibility_only:a}=t,o=i&&i.length?new Set(i):null;return e.filter(e=>{if(o&&!o.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(s){const t=s[at(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(a&&!e.barrier_free)})}(Array.isArray(i.departures)?i.departures:[],{...e,accessibility_only:this._config.accessibility_only}),a=Array.isArray(i.elevator_info)?i.elevator_info:[],o=this._debugElevator.filter(t=>t.__debug_entity===e.entity),l=[...a,...o],d=this._config.show_elevator_info&&l.length>0,c=this._stopMapUrl(n,i.latitude,i.longitude),h=this._t("open_in_maps"),p=this._computeHeroGroup(s),u=p[0],_=this._config.show_hero_metric?new Set(p):new Set,f=s.filter(e=>!_.has(e)),g=f.slice(0,this._config.max_departures),m=_t(this.hass,e.entity),b=u?it(u.line||"",this._config.line_colors,m):"var(--primary-color)",w=(v=u?.type,je(v)??"mdi:bus-stop");var v;const y=u&&Number.isFinite(u.countdown)?u.countdown:null,$=null===y?"—":y<=0?this._t("now"):String(y),x=null!==y&&y>0?this._t("min"):"",k=void 0!==t;return F`
      <section
        class="station"
        style="--wl-accent: ${b};"
        id=${k?`wl-tabpanel-${t}`:K}
        role=${k?"tabpanel":K}
        aria-labelledby=${k?`wl-tab-${t}`:K}
        tabindex=${k?"0":K}
        aria-label=${n}
      >
        ${this._config.hide_header?K:F`<header class="head">
              <span class="icon-tile" aria-hidden="true">
                <ha-icon icon=${w}></ha-icon>
              </span>
              <div class="title-block">
                <h3 class="title">${pt(r,e.entity)}</h3>
                ${u?.line?F`<p class="subtitle">${pt(u.towards)}</p>`:K}
              </div>
              ${c?F`<div class="head-actions">
                    <a
                      class="icon-action"
                      href=${c}
                      target="_blank"
                      rel="noopener noreferrer"
                      title=${h}
                      aria-label="${h}: ${n}"
                    ><ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon></a>
                  </div>`:K}
            </header>`}

        ${this._config.show_hero_metric&&u?F`<div class="hero-host">
              <div class="hero">
                <div class="hero-time" aria-live="polite" aria-atomic="true">
                  <span class="hero-min">${$}</span>
                  ${x?F`<span class="hero-unit">${x}</span>`:K}
                </div>
                ${p.flatMap(t=>[this._renderHeroEntry(t,e.entity),this._renderHeroPanelForEntry(t,e.entity)])}
              </div>
            </div>`:K}
        ${d?this._renderElevatorDetails(l):K}
        ${this._config.show_departures&&this._config.max_departures>0?g.length?F`<ul class="dep-list" role="list" aria-label=${this._t("departures_list")}>
                ${g.map(t=>this._renderRow(t,e.entity))}
              </ul>`:F`<div class="empty" role="status" aria-live="polite">
                ${this._t(i.server_time?"betriebsschluss":"no_data")}
              </div>`:K}
      </section>
    `}_renderElevatorDetails(e){return F`
      <div class="alert-list">
        ${e.map(e=>this._renderElevatorDetail(e))}
      </div>
    `}_renderElevatorDetail(e){const t=e.description||e.station||"",i=e.reason||"",r=dt(e.time_end,this._lang()),n=Boolean(i||r),s=this._expandedElevator.has(e.name);return F`
      <div
        class=${ve({alert:!0,expanded:s,"no-detail":!n})}
        role=${n?"button":"group"}
        tabindex=${n?"0":"-1"}
        aria-expanded=${n?s?"true":"false":K}
        aria-label=${t}
        @click=${()=>n&&this._toggleElevator(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,n,()=>this._toggleElevator(e.name))}
      >
        <ha-icon icon="mdi:elevator-passenger-off" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            <div class="alert-title">${pt(t)}</div>
          </div>
          ${n?F`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${i?F`<div class="alert-desc">${pt(i)}</div>`:K}
                  ${r?F`<div class="alert-meta">
                        <span>${this._t("elevator_until")} ${r}</span>
                      </div>`:K}
                </div>
              </div>`:K}
        </div>
        ${n?F`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:K}
      </div>
    `}_toggleElevator(e){const t=new Set(this._expandedElevator);t.has(e)?t.delete(e):t.add(e),this._expandedElevator=t}_onExpanderKeydown(e,t,i){t&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),i()))}_renderTrafficBanner(e){const t=new Set,i=[];for(const r of e)for(const e of this._attrs(r.entity).traffic_info??[])t.has(e.name)||(t.add(e.name),i.push(e));for(const e of this._debugTraffic)t.has(e.name)||(t.add(e.name),i.push(e));return i.length?F`
      <div class="alert-list">
        ${i.map(e=>this._renderTrafficItem(e))}
      </div>
    `:K}_renderTrafficItem(e){const t=this._config.line_colors,i=function(e,t){if(!e||!t)return{};for(const i of t.entities){const t=_t(e,i.entity);if(Object.keys(t).length)return t}return{}}(this.hass,this._config),r=Array.isArray(e.related_lines)?e.related_lines:[],n=e.description_html?lt(e.description_html):e.description?lt(e.description):"",s=dt(e.time_end,this._lang()),a=dt(e.time_last_update,this._lang()),o=dt(e.time_created,this._lang()),l=a&&a!==o?a:"",d=Boolean(e.location||s||l),c=Boolean(n||d),h=this._expandedTraffic.has(e.name),p={alert:!0,expanded:h,"no-detail":!c},u=e.title||this._t("traffic_label");return F`
      <div
        class=${ve(p)}
        role=${c?"button":"group"}
        tabindex=${c?"0":"-1"}
        aria-expanded=${c?h?"true":"false":K}
        aria-label=${u}
        @click=${()=>c&&this._toggleTraffic(e.name)}
        @keydown=${t=>this._onExpanderKeydown(t,c,()=>this._toggleTraffic(e.name))}
      >
        <ha-icon icon="mdi:alert-octagon" aria-hidden="true"></ha-icon>
        <div class="alert-body">
          <div class="alert-summary">
            ${r.length?F`<div class="alert-lines">
                  ${r.map(e=>F`<span
                      class="alert-line-badge"
                      style=${xe(rt(e,t,i))}
                    >${e}</span>`)}
                </div>`:K}
            <div class="alert-title">${e.title?pt(e.title):this._t("traffic_label")}</div>
          </div>
          ${c?F`<div class="alert-detail">
                <div class="alert-detail-inner">
                  ${n?F`<div class="alert-desc">${we(n)}</div>`:K}
                  ${d?F`<div class="alert-meta">
                        ${e.location?F`<span class="alert-location-chip">
                              <ha-icon icon="mdi:map-marker" aria-hidden="true"></ha-icon>${pt(e.location)}
                            </span>`:K}
                        ${s?F`<span>${this._t("traffic_until")} ${s}</span>`:K}
                        ${l?F`<span>${this._t("traffic_updated")} ${l}</span>`:K}
                      </div>`:K}
                </div>
              </div>`:K}
        </div>
        ${c?F`<ha-icon class="alert-chevron" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>`:K}
      </div>
    `}_toggleTraffic(e){const t=new Set(this._expandedTraffic);t.has(e)?t.delete(e):t.add(e),this._expandedTraffic=t}_computeHeroGroup(e){if(0===e.length)return[];const t=e=>Number.isFinite(e.countdown)?e.countdown:Number.POSITIVE_INFINITY;let i=Number.POSITIVE_INFINITY;for(const r of e){const e=t(r);e<i&&(i=e)}if(!Number.isFinite(i)){const t=e[0];return t?[t]:[]}return i<=0?e.filter(e=>t(e)<=0):e.filter(e=>t(e)===i)}_renderHeroEntry(e,t){const i=rt(e.line||"",this._config.line_colors,_t(this.hass,t)),r=this._config.show_platform&&e.platform?String(e.platform):null,n=!!e.barrier_free&&this._config.show_accessibility,s=!1!==this._config.show_stops_ahead&&Array.isArray(e.stops_ahead)&&e.stops_ahead.length>0,a=e.time_planned??`cd${e.countdown}`,o=`${t}|${e.line}|${e.direction}|${e.towards??""}|${a}`,l=s&&this._expandedRows.has(o),d=`wl-hero-stopsahead-${t.replace(/[^a-z0-9_]/gi,"_")}-${e.line}-${e.direction}-${e.countdown}`,c=l?"stops_ahead_aria_hide":"stops_ahead_aria_show",h=s?this._t(c,{line:e.line||"?",towards:e.towards||""}):"",p={"hero-entry":!0,expandable:s,expanded:l},u=e.line||"?";return F`
      <div
        class=${ve(p)}
        role=${s?"button":K}
        tabindex=${s?"0":K}
        aria-expanded=${s?l?"true":"false":K}
        aria-controls=${s?d:K}
        aria-label=${s?h:K}
        @click=${()=>s&&this._toggleRow(o)}
        @keydown=${e=>this._onExpanderKeydown(e,s,()=>this._toggleRow(o))}
      >
        <span
          class="line-badge"
          style=${xe(i)}
        >${u}</span>
        <span class="hero-direction">${pt(e.towards)}</span>
        ${r?F`<span class="hero-platform"
              >${this._t(ut(e.type))} ${r}</span
            >`:K}
        ${n?F`<span
              class="hero-a11y"
              role="img"
              aria-label=${this._t("barrier_free_title")}
              title=${this._t("barrier_free_title")}
            >
              <ha-icon
                icon="mdi:wheelchair-accessibility"
                aria-hidden="true"
              ></ha-icon>
            </span>`:K}
        ${s?F`<ha-icon
              class="hero-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:K}
      </div>
    `}_renderHeroPanelForEntry(e,t){if(!(!1!==this._config.show_stops_ahead&&Array.isArray(e.stops_ahead)&&e.stops_ahead.length>0))return K;const i=e.time_planned??`cd${e.countdown}`,r=`${t}|${e.line}|${e.direction}|${e.towards??""}|${i}`,n=this._expandedRows.has(r),s=`wl-hero-stopsahead-${t.replace(/[^a-z0-9_]/gi,"_")}-${e.line}-${e.direction}-${e.countdown}`,a=e.line||"?";return this._renderHeroStopsAheadPanel(e.stops_ahead,s,n,a,r,t)}_renderHeroStopsAheadPanel(e,t,i,r,n,s){const a=this._config.line_colors,o=_t(this.hass,s);return F`
      <div
        class=${ve({"hero-detail":!0,expanded:i})}
        id=${t}
        role="region"
        aria-hidden=${i?"false":"true"}
      >
        <div class="hero-detail-inner">
          <ol
            class="stops-ahead"
            style=${xe({"--stops-ahead-line":it(r,a,o)})}
          >
            ${e.map((e,t)=>this._renderStopAhead(e,t,n,a,o))}
          </ol>
        </div>
      </div>
    `}_renderRow(e,t){const i=this._config.line_colors,r=_t(this.hass,t),n=e.line||"?",s=rt(n,i,r),a=Number.isFinite(e.countdown)?e.countdown:null,o=null===a?"—":a<=0?this._t("now"):`${a} ${this._t("min")}`,l=function(e,t){if(!e||!t)return null;const i=Date.parse(e),r=Date.parse(t);return Number.isFinite(i)&&Number.isFinite(r)?Math.round((r-i)/6e4):null}(e.time_planned,e.time_real),d=this._config.show_delay&&null!==l&&l>=1?1===l?this._t("delay_singular"):this._t("delay_plural",{n:l}):"",c=null!==a&&a<=0?"now":null!==l&&l>=1?"late":null!==l&&l<=-1?"early":"",h=this._config.show_accessibility,p=Boolean(e.traffic_jam||h&&e.barrier_free),u=this._config.show_platform&&e.platform?String(e.platform):null,_=this._config.show_type_icon?je(e.type):null,f=!1!==this._config.show_stops_ahead&&Array.isArray(e.stops_ahead)&&e.stops_ahead.length>0,g=e.time_planned??`cd${e.countdown}`,m=`${t}|${e.line}|${e.direction}|${e.towards??""}|${g}`,b=f&&this._expandedRows.has(m),w=`wl-stopsahead-${t.replace(/[^a-z0-9_]/gi,"_")}-${e.line}-${e.direction}-${e.countdown}`,v=b?"stops_ahead_aria_hide":"stops_ahead_aria_show",y=f?this._t(v,{line:n,towards:e.towards||""}):"",$=F`
      <li
        class=${ve({"dep-row":!0,expandable:f,expanded:b})}
        role=${f?"button":K}
        tabindex=${f?"0":K}
        aria-expanded=${f?b?"true":"false":K}
        aria-controls=${f?w:K}
        aria-label=${f?y:K}
        @click=${()=>f&&this._toggleRow(m)}
        @keydown=${e=>this._onExpanderKeydown(e,f,()=>this._toggleRow(m))}
      >
        <div class="line-badge" style=${xe(s)}>${n}</div>
        <div class="towards">
          ${_?F`<ha-icon class="type-icon" icon=${_} aria-hidden="true"></ha-icon>`:K}${pt(e.towards)}${d?F` <span class="delay">${d}</span>`:K}
        </div>
        ${u||p?F`<span class="row-end">
              ${u?F`<span class="row-platform"
                    >${this._t(ut(e.type))} ${u}</span
                  >`:K}
              ${p?F`<span class="row-flags">
                    ${e.traffic_jam?F`<ha-icon
                          class="disturbance"
                          icon="mdi:alert-circle"
                          role="img"
                          aria-label=${this._t("disturbance_title")}
                          title=${this._t("disturbance_title")}
                        ></ha-icon>`:K}
                    ${h&&e.barrier_free?F`<ha-icon
                          class="a11y"
                          icon="mdi:wheelchair-accessibility"
                          role="img"
                          aria-label=${this._t("barrier_free_title")}
                          title=${this._t("barrier_free_title")}
                        ></ha-icon>`:K}
                  </span>`:K}
            </span>`:F`<span></span>`}
        <div class=${ve({countdown:!0,[c]:!!c})}>${o}</div>
        ${f?F`<ha-icon
              class="row-chevron"
              icon="mdi:chevron-down"
              aria-hidden="true"
            ></ha-icon>`:K}
      </li>
    `;return f?[$,this._renderStopsAheadPanel(e.stops_ahead,w,b,n,m,t)]:$}_renderStopsAheadPanel(e,t,i,r,n,s){const a=this._config.line_colors,o=_t(this.hass,s);return F`
      <li
        class=${ve({"dep-row-detail":!0,expanded:i})}
        id=${t}
        role="region"
        aria-hidden=${i?"false":"true"}
      >
        <div class="dep-row-detail-inner">
          <ol
            class="stops-ahead"
            style=${xe({"--stops-ahead-line":it(r,a,o)})}
          >
            ${e.map((e,t)=>this._renderStopAhead(e,t,n,a,o))}
          </ol>
        </div>
      </li>
    `}_renderStopAhead(e,t,i,r,n){const s=e.lines??[],a=this._isNightlineHour(),o=[],l=[];for(const e of s)/^U\d/.test(e)||a&&/^N\d/.test(e)?o.push(e):l.push(e);const d=`${i}|${t}`,c=this._expandedTransfers.has(d),h={"stops-ahead-stop":!0,terminus:!!e.is_terminus,"transfers-expanded":c},p=o.length?F`<span class="stops-ahead-metros">
          ${o.map(e=>F`<span
              class="stops-ahead-line-chip"
              style=${xe(rt(e,r,n))}
              >${e}</span
            >`)}
        </span>`:K,u=l.length?F`<button
          type="button"
          class="stops-ahead-other-toggle"
          aria-expanded=${c?"true":"false"}
          aria-label=${this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name})}
          @click=${e=>{e.stopPropagation(),this._toggleTransfers(d)}}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||e.stopPropagation()}}
        >
          <span class="stops-ahead-other-count">+${l.length}</span>
          <ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
        </button>`:K,_=l.length&&c?F`<div class="stops-ahead-others">
            ${l.map(e=>F`<span
                class="stops-ahead-line-chip stops-ahead-line-chip--other"
                style=${xe(rt(e,r,n))}
                >${e}</span
              >`)}
          </div>`:K,f=l.length>0,g=f?this._t(c?"stops_ahead_other_hide":"stops_ahead_other_show",{count:l.length,stop:e.name}):"";return F`
      <li class=${ve(h)}>
        <div
          class="stops-ahead-row"
          role=${f?"button":K}
          tabindex=${f?"0":K}
          aria-expanded=${f?c?"true":"false":K}
          aria-label=${f?g:K}
          @click=${f?e=>{e.stopPropagation(),this._toggleTransfers(d)}:K}
          @keydown=${f?e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),e.stopPropagation(),this._toggleTransfers(d))}:K}
        >
          <span class="stops-ahead-dot" aria-hidden="true"></span>
          <span class="stops-ahead-name">${pt(e.name)}</span>
          ${p} ${u}
        </div>
        ${_}
      </li>
    `}_toggleTransfers(e){const t=new Set(this._expandedTransfers);t.has(e)?t.delete(e):t.add(e),this._expandedTransfers=t}_isNightlineHour(){const e=new Date,t=60*e.getHours()+e.getMinutes();return t>=1435||t<=315}_toggleRow(e){const t=new Set(this._expandedRows);t.has(e)?t.delete(e):t.add(e),this._expandedRows=t}_stopMapUrl(e,t,i){let r=null;return"number"==typeof t&&"number"==typeof i?r=`https://www.google.com/maps/search/?api=1&query=${t},${i}`:e&&(r=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e}, Wien`)}`),r?("string"!=typeof(n=r)?"":/^https?:\/\//i.test(n)?n:"")||null:null;var n}_isDevMode(){try{const e=window.location.hostname||"";if("rpi25"===e||e.startsWith("rpi25."))return!0;if((window.location.search||"").includes("wl_debug=1"))return!0}catch{}return!1}_renderDevModePanel(){return this._isDevMode()?F`
      <div class="dev-strip">
        <span class="dev-strip-label">${this._t("devmode_title")}</span>
        <button type="button" @click=${this._devTestTraffic}>${this._t("devmode_traffic_btn")}</button>
        <button type="button" @click=${this._devTestElevator}>${this._t("devmode_elevator_btn")}</button>
        <button type="button" class="dev-strip-clear" @click=${this._devClear}>
          ${this._t("devmode_clear_btn")}
        </button>
      </div>
    `:K}_randomFrom(e){return e.length?e[Math.floor(Math.random()*e.length)]??null:null}static{this.styles=ke}};e([pe({attribute:!1})],ft.prototype,"hass",void 0),e([ue()],ft.prototype,"_config",void 0),e([ue()],ft.prototype,"_activeTab",void 0),e([ue()],ft.prototype,"_versionMismatch",void 0),e([ue()],ft.prototype,"_expandedTraffic",void 0),e([ue()],ft.prototype,"_expandedElevator",void 0),e([ue()],ft.prototype,"_expandedRows",void 0),e([ue()],ft.prototype,"_expandedTransfers",void 0),e([ue()],ft.prototype,"_debugTraffic",void 0),e([ue()],ft.prototype,"_debugElevator",void 0),ft=e([de("wiener-linien-austria-card")],ft);export{ft as WienerLinienAustriaCard};
