// Wiener Linien Austria — bundled by Rollup. Edit sources in src/, then `npm run build`.
function e(e,t,i,r){var n,a=arguments.length,o=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,r);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(o=(a<3?n(o):a>3?n(t,i,o):n(t,i))||o);return a>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new a(i,e,r)},s=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,m=g?g.emptyScript:"",f=_.reactiveElementPolyfillSupport,w=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?m:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),v={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&c(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const a=r?.call(this);n?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??v}static _$Ei(){if(this.hasOwnProperty(w("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(w("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(w("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(s(e))}else void 0!==e&&t.push(s(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=r;const a=n.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const a=this.constructor;if(!1===r&&(n=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??y)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==n||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[w("elementProperties")]=new Map,x[w("finalized")]=new Map,f?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,$=e=>e,S=k.trustedTypes,z=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+E,C=`<${T}>`,L=document,R=()=>L.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,M=Array.isArray,H="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,W=/-->/g,B=/>/g,N=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,q=/"/g,j=/^(?:script|style|textarea|title)$/i,U=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),K=U(1),I=U(2),F=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),G=new WeakMap,Y=L.createTreeWalker(L,129);function Z(e,t){if(!M(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(t):t}const X=(e,t)=>{const i=e.length-1,r=[];let n,a=2===t?"<svg>":3===t?"<math>":"",o=P;for(let t=0;t<i;t++){const i=e[t];let s,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===P?"!--"===l[1]?o=W:void 0!==l[1]?o=B:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=n??P,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?N:'"'===l[3]?q:O):o===q||o===O?o=N:o===W||o===B?o=P:(o=N,n=void 0);const h=o===N&&e[t+1].startsWith("/>")?" ":"";a+=o===P?i+C:c>=0?(r.push(s),i.slice(0,c)+A+i.slice(c)+E+h):i+E+(-2===c?t:h)}return[Z(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class Q{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,a=0;const o=e.length-1,s=this.parts,[l,c]=X(e,t);if(this.el=Q.createElement(l,i),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=Y.nextNode())&&s.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(A)){const t=c[a++],i=r.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?re:"?"===o[1]?ne:"@"===o[1]?ae:ie}),r.removeAttribute(e)}else e.startsWith(E)&&(s.push({type:6,index:n}),r.removeAttribute(e));if(j.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],R()),Y.nextNode(),s.push({type:2,index:++n});r.append(e[t],R())}}}else if(8===r.nodeType)if(r.data===T)s.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)s.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=L.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,r){if(t===F)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const a=D(t)?void 0:t._$litDirective$;return n?.constructor!==a&&(n?._$AO?.(!1),void 0===a?n=void 0:(n=new a(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=J(e,n._$AS(e,t.values),n,r)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??L).importNode(t,!0);Y.currentNode=r;let n=Y.nextNode(),a=0,o=0,s=i[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new te(n,n.nextSibling,this,e):1===s.type?t=new s.ctor(n,s.name,s.strings,this,e):6===s.type&&(t=new oe(n,this,e)),this._$AV.push(t),s=i[++o]}a!==s?.index&&(n=Y.nextNode(),a++)}return Y.currentNode=L,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),D(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>M(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Q.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new ee(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new Q(e)),t}k(e){M(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new te(this.O(R()),this.O(R()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(e,t=this,i,r){const n=this.strings;let a=!1;if(void 0===n)e=J(this,e,t,0),a=!D(e)||e!==this._$AH&&e!==F,a&&(this._$AH=e);else{const r=e;let o,s;for(e=n[0],o=0;o<n.length-1;o++)s=J(this,r[i+o],t,o),s===F&&(s=this._$AH[o]),a||=!D(s)||s!==this._$AH[o],s===V?e=V:e!==V&&(e+=(s??"")+n[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class re extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class ne extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class ae extends ie{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??V)===F)return;const i=this._$AH,r=e===V&&i!==V||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==V&&(i===V||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const se=k.litHtmlPolyfillSupport;se?.(Q,te),(k.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;let ce=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new te(t.insertBefore(R(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},ue=(e=pe,t,i)=>{const{kind:r,metadata:n}=i;let a=globalThis.litPropertyMetadata.get(n);if(void 0===a&&globalThis.litPropertyMetadata.set(n,a=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function _e(e){return(t,i)=>"object"==typeof i?ue(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ge(e){return _e({...e,state:!0,attribute:!1})}const me=1,fe=3,we=4,be=e=>(...t)=>({_$litDirective$:e,values:t});let ye=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const ve=be(class extends ye{constructor(e){if(super(e),e.type!==me||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const i=e.element.classList;for(const e of this.st)e in t||(i.remove(e),this.st.delete(e));for(const e in t){const r=!!t[e];r===this.st.has(e)||this.nt?.has(e)||(r?(i.add(e),this.st.add(e)):(i.remove(e),this.st.delete(e)))}return F}}),xe={},ke=(e,t=xe)=>e._$AH=t,$e=be(class extends ye{constructor(){super(...arguments),this.key=V}render(e,t){return this.key=e,t}update(e,[t,i]){return t!==this.key&&(ke(e),this.key=t),i}}),Se="important",ze=" !"+Se,Ae=be(class extends ye{constructor(e){if(super(e),e.type!==me||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(ze);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?Se:""):i[e]=r}}return F}});function Ee(e,t){return e?K`<span lang="de">${e}</span>`:t??""}const Te="ptMetro";var Ce={editor:{add_chip:"Chip hinzufügen",add_icon:"Symbol hinzufügen",date_format_placeholder:"d.m.Y",direction_label:"Fahrtrichtung",direction_not_served:"nicht bedient",direction_note_one_way:"Rückfahrt deaktiviert: {line} endet hier.",direction_unavailable:"Keine Abfahrten in dieser Richtung",header_amenities:"Symbole in diesem Slot",header_bar_aria:"Stationsanzeige — Seite wählen",header_chips_and_icons:"Textchips (max. {chips}) und Extra-Symbole (max. {icons})",header_left:"Linke Seite",header_pick_side_hint:"Seite antippen, dann unten füllen",header_right:"Rechte Seite",header_side_aria:"Seite der Stationsanzeige",header_slot_empty:"leer",line_active_aria:"Linie {line} aktiv",line_inactive_aria:"Linie {line} inaktiv",lines_empty_means_all:"leer = alle Linien",lines_label:"Linien an dieser Haltestelle",lines_selected:"{n} von {total}",no_lines_hint:"Wähle zuerst eine Haltestelle — die Linien kommen live aus der API.",no_lines_title:"Noch keine Linien verfügbar",per_line_direction_aria:"Linie {line}: {direction}",remove_chip_aria:"Chip {chip} entfernen",remove_icon_aria:"Symbol {icon} entfernen",remove_stop:"Haltestelle entfernen",section_board:"Fallblatt-Tafel",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Fußzeile",section_header:"Stationsanzeige",section_header_hint:"Direkt am Balken",section_led_panel:"LED-Anzeige",section_station:"Stationsband",section_walk_time:"Gehzeit zur Haltestelle",show_clock_short:"Uhr",show_date_short:"Datum",show_elevator_short:"Lift",show_escalator_short:"Rolltreppe",show_wc_short:"WC",size_medium:"Mittel",size_regular:"Standard",size_small:"Klein",tab_display:"Anzeige",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Stil",text_placeholder:"z. B. Name der nächsten Station",walk_time_aria:"Gehzeit in Minuten für Linie {line} Richtung {towards}",walk_time_branching_hint:"Gilt für alle Endstationen in dieser Richtung",walk_time_hint:"Blendet Abfahrten aus, die ohne dich abfahren würden. Leer = kein Filter.",walk_time_less_aria:"Gehzeit für Linie {line} verringern",walk_time_more_aria:"Gehzeit für Linie {line} erhöhen",walk_time_placeholder:"–",walk_time_unit:"Minuten"}},Le={no_data:"Keine Abfahrten verfügbar",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",stale_feed_detail:"Die Wiener Linien melden für diese Haltestelle veraltete Abfahrtszeiten. Sobald wieder Echtzeitdaten kommen, füllt sich die Anzeige automatisch.",stale_feed_since:"Letzte gemeldete Abfahrt: {time}",stale_feed_partial:"Einzelne Linien melden keine aktuellen Zeiten.",min:"Min",now:"Jetzt",platform_short_rail:"Gleis",platform_short_bus:"Steig",version_update:"Wiener Linien Austria wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie einen anderen Sensor oder entfernen Sie ihn aus den Haltestellen dieser Karte.",no_entities_picked:"Keine Haltestelle ausgewählt",no_entities_available:"Keine Wiener-Linien-Sensoren gefunden",departures_list:"Kommende Abfahrten",barrier_free_title:"Barrierefrei zugänglich",cooling_title:"Klimatisiert",disturbance_title:"Verkehrsbehinderung gemeldet",stops_ahead_aria_show:"Streckenverlauf für {line} Richtung {towards} anzeigen",stops_ahead_aria_hide:"Streckenverlauf für {line} Richtung {towards} ausblenden",stops_ahead_transfer_aria:"Umsteigen auf {lines}",stops_ahead_other_show:"{count} weitere Linien bei {stop} anzeigen",stops_ahead_other_hide:"Weitere Linien bei {stop} ausblenden",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",dir_both:"Beide",traffic_label:"Störung",traffic_until:"Bis",traffic_updated:"aktualisiert",elevator_label:"Aufzug außer Betrieb",elevator_until:"Bis",open_in_maps:"In Karte öffnen",qr_open:"QR-Code anzeigen",qr_dialog_title:"QR-Code für Haltestelle",qr_dialog_hint:"Mit dem Smartphone scannen — öffnet die Haltestelle in der Karten-App.",qr_dialog_close:"QR-Code schließen",delay_singular:"1 Min. verspätet",delay_plural:"{n} Min. verspätet",devmode_title:"DEV",devmode_traffic_btn:"Störung testen",devmode_elevator_btn:"Aufzug testen",devmode_colors_btn:"Linienfarben",devmode_clear_btn:"Löschen",editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Barrierefrei-Symbol anzeigen“.",colors_empty_hint:"Wähle im Reiter Stops Haltestellen aus — die Linien erscheinen dann hier.",colors_hint:"Optional. Ohne Überschreibung gilt die offizielle Linienfarbe.",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die Quellenangabe ausgeblendet.",hide_header:"Kopfzeile ausblenden",hide_header_helper:"Wenn aktiv, wird die Titelleiste der Karte ausgeblendet.",layout:"Layout mehrerer Haltestellen",layout_requires:"Wirkt erst ab zwei Haltestellen.",layout_stacked:"Gestapelt",layout_tabs:"Reiter",max_departures:"Anzahl Abfahrten pro Haltestelle",pick_color_for_line:"Farbe für Linie {line} wählen",reset_color:"Auf Standard zurücksetzen",reset_color_aria:"Linienfarbe {line} auf Standard zurücksetzen",section_colors:"Linienfarben",section_colors_hint:"überschreibt API-Farbe",section_departure_row:"Abfahrtszeile",section_departure_row_hint:"pro Zeile",section_display:"Anzeige",section_disruptions:"Störungen & Verspätungen",section_layout:"Aufbau",section_layout_hint:"Struktur",show_accessibility:"Barrierefrei-Symbol anzeigen",show_cooling:"Klimaanlagen-Symbol anzeigen",show_cooling_helper:"Zeigt eine Schneeflocke neben Abfahrten mit klimatisiertem Fahrzeug. Wiener Linien melden das pro Fahrzeug — ältere Garnituren liefern die Angabe nicht.",show_delay:"Verspätungen anzeigen",show_delay_colors:"Verspätungen farblich hervorheben",show_delay_colors_helper:"Färbt die Minutenzahl rot, wenn eine Abfahrt verspätet ist, und grün, wenn sie zu früh kommt.",show_delay_colors_requires:"Braucht „Verspätungen anzeigen“.",show_departures:"Abfahrtsliste anzeigen",show_elevator_info:"Aufzugsausfälle anzeigen",show_hero_metric:"Nächste Abfahrt groß anzeigen",show_platform:"Gleis/Steig anzeigen",show_qr_button:"QR-Code-Schaltfläche anzeigen",show_stops_ahead:"Zwischenstationen anzeigen",show_traffic_info:"Störungen anzeigen",show_type_icon:"Verkehrsmittel-Symbol anzeigen"}},Re={editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",flicker:"LED-Flackern simulieren",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",housing:"LED-Gehäuserahmen anzeigen",housing_helper:"Dunkler Rahmen um die LED-Anzeige mit dezentem Glas-Reflex obenauf.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",line_stripe:"Seitlichen Linienstreifen anzeigen",line_stripe_helper:"4-Pixel-Balken am linken Rand jeder Zeile in der Linienfarbe.",message_text:"Nachricht",message_text_requires:"Braucht „Lauftext anzeigen“.",message_ticker:"Laufschrift",message_ticker_helper:"Zeigt alle 5 Minuten eine eigene Nachricht als Laufschrift über die Anzeige.",platform_side:"Gleis/Steig-Seite",platform_side_auto:"Automatisch (1 = rechts, 2 = links)",platform_side_helper:"Standard folgt der Wiener-Linien-Beschilderung (Gleis 2 links, sonst rechts). Manuell überschreibbar.",platform_side_left:"Immer links",platform_side_requires:"Braucht „Steig anzeigen“.",platform_side_right:"Immer rechts",section_display:"Anzeige",section_display_hint:"LED-Feld",section_header_hint:"Direkt am Balken",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als weiße Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als weiße Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_pill:"Linien-Plakette anzeigen",show_line_pill_helper:"Liniencode als gefüllte Plakette in der Linienfarbe statt als schlichter Text.",show_platform:"Steig anzeigen",show_station_name:"Stationsnamen anzeigen",show_unit:"Einheit „min“ anzeigen",show_unit_helper:"Kleines „min“ in Amber-Versalien nach jeder Minutenzahl.",size:"Größe",station_bg:"Stationsschild-Hintergrund",station_bg_black:"Schwarz",station_bg_default:"Standard",station_bg_white:"Weiß",style:"Stil",style_classic:"Klassisch",style_pixel:"Punktmatrix",style_warm:"Warm",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",wheelchair_race:"Rollstuhl-Rennen (Easter Egg)"},aria_dismiss_message:"Lauftext schließen",aria_start_race:"Barrierefreiheits-Rennen starten",at_platform:"Einfahrt",barrier_free_title:"Barrierefrei zugänglich",betriebsschluss:"Betriebsschluss",countdown_minutes:"{n} Minuten",departures_list:"Kommende Abfahrten",dir_both:"Beide",dir_h:"Hinfahrt",dir_h_short:"H",dir_r:"Rückfahrt",dir_r_short:"R",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",gleis:"GLEIS",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",no_entity:"Keine Haltestelle ausgewählt",race_finished:"Barrierefreiheits-Rennen beendet",race_starting_in:"Rennen startet in {n}",race_winner_announce:"Rollstuhl {n} gewinnt das Barrierefreiheits-Rennen",stale_feed:"Keine aktuellen Daten",steig:"STEIG",unit_min:"min",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",version_update:"Retro-Karte wurde auf v{v} aktualisiert — bitte neu laden",via_prefix:"ÜBER"},De={no_entity:"Keine Haltestelle ausgewählt",no_data:"Keine Abfahrten",no_data_wrong_direction:"Keine Abfahrten in dieser Richtung",no_data_wrong_line:"Keine Abfahrten für diese Linie",betriebsschluss:"Betriebsschluss",stale_feed:"Keine aktuellen Daten",dir_h:"Hinfahrt",dir_r:"Rückfahrt",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"STEIG",col_line:"LINIE",col_dest:"RICHTUNG",col_step_free:"STUFENLOS",col_cd:"ANKUNFT",version_update:"Klappanzeige wurde auf v{v} aktualisiert — bitte neu laden",version_reload:"Neu laden",version_reload_stuck:"Neu laden hat die neue Version nicht übernommen. Schließen Sie diesen Browser-Tab und öffnen Sie das Dashboard erneut, oder löschen Sie die Website-Daten für Home Assistant in den Browser-Einstellungen.",entity_missing:"Sensor {entity} existiert nicht mehr. Wählen Sie oben einen anderen Sensor.",departures_list:"Kommende Abfahrten",at_platform:"Einfahrt",countdown_minutes:"{n} Minuten",barrier_free_title:"Barrierefrei zugänglich",not_barrier_free_title:"Nicht barrierefrei",unit_min:"min",dir_both:"Beide",header:{icon_exit:"Ausgang",icon_exit_access:"Stufenloser Ausgang",icon_wc:"WC",icon_escalator:"Rolltreppe",icon_elevator:"Aufzug",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_door_open:"Offene Tür",icon_mdi_stairs:"Treppe"},editor:{accessibility_only:"Nur barrierefreie Abfahrten anzeigen",accessibility_only_requires:"Braucht „Rollstuhl-Plakette anzeigen“.",chips:"Zusätzliche Beschriftungen",chips_helper:"Kurze Beschriftungen nach den Symbolen (z. B. Gleis- oder Liniennummern). Maximal 6 pro Seite, je 16 Zeichen.",date_format:"Datumsformat",date_format_helper:"Beispiel: d.m.Y → 25.05.2026. Zeichen: d j (Tag), m n (Monat), Y y (Jahr), D l (Wochentag), M F (Monatsname). Alles andere bleibt unverändert.",entities:"Haltestellen",exit:"Ausgangssymbol",extra_icons:"Zusätzliche Symbole",extra_icons_helper:"Bis zu 3 MDI-Symbole pro Seite. Im Katalog suchen oder einen mdi:-Schlüssel einfügen.",header_exit_accessible:"Stufenloser Ausgang",header_exit_none:"Kein",header_exit_regular:"Ausgang",hide_attribution:"Datenquelle ausblenden",hide_attribution_helper:"Wenn aktiv, wird die CC-BY-Quellenangabe am unteren Rand der Karte ausgeblendet. Die OGD-Lizenz der Wiener Linien verlangt eine sichtbare Quellenangabe, sofern der Hinweis nicht an anderer Stelle im Dashboard erscheint.",housing:"Gehäuserahmen anzeigen",housing_helper:"Umrahmt die Tafel mit dem Gehäuse inkl. dezenter Innenkante und Schlagschatten. Gehäusefarbe folgt dem HA-Theme (cremefarben im Hellmodus, dunkel im Dunkelmodus). Aus = Tafel sitzt bündig auf dem Dashboard.",icon_mdi_door_open:"Offene Tür",icon_mdi_exit_run:"Ausgang (laufende Person)",icon_mdi_exit_to_app:"Ausgang (Tür)",icon_mdi_stairs:"Treppe",max_rows:"Anzahl Zeilen",max_rows_helper:"Wie viele Abfahrten die Tafel zeigt (1–8). Über alle Haltestellen zusammengeführt, nach Abfahrtszeit sortiert.",section_display:"Anzeige",section_display_hint:"Fallblatt-Feld",section_station_helper:"Das farbige Band mit Stationsname und Uhrzeit am oberen Rand der Tafel.",show_accessibility:"Rollstuhl-Plakette anzeigen",show_accessibility_helper:"Zeigt eine Rollstuhl-Plakette neben barrierefreien Abfahrten.",show_clock:"Uhr-Plakette anzeigen",show_clock_helper:"Aktuelle Uhrzeit (HH:MM) als cremefarbene Plakette am innen liegenden Rand dieser Seite.",show_date:"Datums-Plakette anzeigen",show_date_helper:"Aktuelles Datum als cremefarbene Plakette neben der Uhr.",show_header:"Stationsanzeige anzeigen",show_header_helper:"Hauptschalter. Einstellungen pro Seite bleiben gespeichert.",show_line_column:"Linienspalte anzeigen",show_line_column_helper:"Zeigt die Spalte mit dem Liniencode. Ausschalten, wenn die Tafel ohnehin nur eine Linie zeigt.",show_min_unit:"Einheit „min“ anzeigen",show_min_unit_helper:"Kleines „min“ neben der Minutenzahl, wie auf echten Stationstafeln.",show_platform:"Gleis/Steig anzeigen",show_platform_helper:"Fügt jeder Zeile eine eigene Gleis-Plakette zwischen Ziel und Minutenzahl hinzu. Wird nur eingeblendet, wenn mindestens eine sichtbare Zeile einen Gleis-Wert hat.",show_station_name:"Stationsnamen anzeigen",show_station_name_helper:"Farbiges Band mit Stationsname und Uhrzeit am oberen Rand der Karte.",size:"Größe",station_bg:"Hintergrund Stationsschild",station_bg_black:"Schwarz",station_bg_helper:"Standard ist die Farbe der ersten erfassten Linie (z. B. Rot für U1, Orange für U3). Bei mehreren Linien kann eine bestimmte Linie gewählt oder auf Weiß bzw. Schwarz umgestellt werden.",station_bg_line:"Erste Linie",station_bg_white:"Weiß",text:"Beschriftung",text_helper:"z. B. Name der nächsten Station.",walk_time_no_data:"Keine passenden Abfahrten. Richtung wechseln oder warten, bis der Sensor Linien meldet."}},Me={common:Ce,modern:Le,retro:Re,flap:De},He={editor:{add_chip:"Add chip",add_icon:"Add icon",date_format_placeholder:"d.m.Y",direction_label:"Direction",direction_not_served:"not served",direction_note_one_way:"Return direction disabled: {line} terminates here.",direction_unavailable:"No departures in this direction",header_amenities:"Icons in this slot",header_bar_aria:"Station sign — choose a side",header_chips_and_icons:"Text chips (max. {chips}) and extra icons (max. {icons})",header_left:"Left side",header_pick_side_hint:"Tap a side, then fill it in below",header_right:"Right side",header_side_aria:"Station sign side",header_slot_empty:"empty",line_active_aria:"Line {line} active",line_inactive_aria:"Line {line} inactive",lines_empty_means_all:"empty = all lines",lines_label:"Lines at this stop",lines_selected:"{n} of {total}",no_lines_hint:"Pick a stop first — lines arrive live from the API.",no_lines_title:"No lines yet",per_line_direction_aria:"Line {line}: {direction}",remove_chip_aria:"Remove chip {chip}",remove_icon_aria:"Remove icon {icon}",remove_stop:"Remove stop",section_board:"Split-flap board",section_extras:"Extras",section_extras_hint:"optional",section_footer:"Footer",section_header:"Station sign",section_header_hint:"Edit on the bar",section_led_panel:"LED panel",section_station:"Station band",section_walk_time:"Walking time to the stop",show_clock_short:"Clock",show_date_short:"Date",show_elevator_short:"Lift",show_escalator_short:"Escalator",show_wc_short:"WC",size_medium:"Medium",size_regular:"Standard",size_small:"Small",tab_display:"Display",tab_stop:"Stop",tab_stops:"Stops",tab_tweaks:"Style",text_placeholder:"e.g. name of the next station",walk_time_aria:"Walking time in minutes for line {line} towards {towards}",walk_time_branching_hint:"Applies to every terminus in this direction",walk_time_hint:"Hides departures that would leave without you. Empty = no filter.",walk_time_less_aria:"Decrease walking time for line {line}",walk_time_more_aria:"Increase walking time for line {line}",walk_time_placeholder:"–",walk_time_unit:"minutes"}},Pe={no_data:"No departures available",betriebsschluss:"End of service",stale_feed:"No live data",stale_feed_detail:"Wiener Linien is sending out-of-date departure times for this stop. Departures return automatically once live data resumes.",stale_feed_since:"Last reported departure: {time}",stale_feed_partial:"Some lines aren't reporting current times.",min:"min",now:"Now",platform_short_rail:"Track",platform_short_bus:"Bay",version_update:"Wiener Linien Austria updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor, or remove it from this card's stops.",no_entities_picked:"No stop selected",no_entities_available:"No Wiener Linien sensors found",departures_list:"Upcoming departures",barrier_free_title:"Step-free access",cooling_title:"Air conditioned",disturbance_title:"Traffic disruption reported",stops_ahead_aria_show:"Show stops ahead for {line} towards {towards}",stops_ahead_aria_hide:"Hide stops ahead for {line} towards {towards}",stops_ahead_transfer_aria:"Change to {lines}",stops_ahead_other_show:"Show {count} more lines at {stop}",stops_ahead_other_hide:"Hide other lines at {stop}",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",dir_both:"Both",traffic_label:"Disruption",traffic_until:"Until",traffic_updated:"updated",elevator_label:"Elevator out of service",elevator_until:"Until",open_in_maps:"Open in maps",qr_open:"Show QR code",qr_dialog_title:"QR code for stop",qr_dialog_hint:"Scan with your phone — opens the stop in your maps app.",qr_dialog_close:"Close QR code",delay_singular:"1 min. late",delay_plural:"{n} min. late",devmode_title:"DEV",devmode_traffic_btn:"Test disruption",devmode_elevator_btn:"Test elevator",devmode_colors_btn:"Line colours",devmode_clear_btn:"Clear",editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show accessibility icon”.",colors_empty_hint:"Pick stops on the Stops tab — their lines will show up here.",colors_hint:"Optional. Without an override the official line colour applies.",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the data-source credit is hidden.",hide_header:"Hide header",hide_header_helper:"When on, the card title bar is hidden.",layout:"Multi-stop layout",layout_requires:"Only takes effect with two or more stops.",layout_stacked:"Stacked",layout_tabs:"Tabs",max_departures:"Departures per stop",pick_color_for_line:"Pick colour for line {line}",reset_color:"Reset to default",reset_color_aria:"Reset line colour {line} to default",section_colors:"Line colours",section_colors_hint:"overrides the API colour",section_departure_row:"Departure row",section_departure_row_hint:"per row",section_display:"Display",section_disruptions:"Disruptions & delays",section_layout:"Structure",section_layout_hint:"Layout",show_accessibility:"Show step-free icon",show_cooling:"Show air-conditioning icon",show_cooling_helper:"Shows a snowflake beside departures with an air-conditioned vehicle. Wiener Linien report this per vehicle — older trains and trams don't send it.",show_delay:"Show delays",show_delay_colors:"Colour-code delays",show_delay_colors_helper:"Turns the countdown number red when a departure runs late and green when it runs early.",show_delay_colors_requires:"Requires “Show delays”.",show_departures:"Show departure list",show_elevator_info:"Show elevator outages",show_hero_metric:"Show next departure large",show_platform:"Show platform / track",show_qr_button:"Show QR-code button",show_stops_ahead:"Show intermediate stops",show_traffic_info:"Show disruption alerts",show_type_icon:"Show vehicle-type icon"}},We={editor:{accessibility_only:"Only show step-free departures",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",flicker:"Simulate LED flicker",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",housing:"Show LED cabinet frame",housing_helper:"Dark bezel around the LED panel with a subtle glass reflection on top.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",line_stripe:"Show line stripe",line_stripe_helper:"A 4 px coloured bar at the left edge of each row, matched to the line.",message_text:"Message",message_text_requires:"Requires “Show ticker”.",message_ticker:"Scrolling message",message_ticker_helper:"Runs a custom message across the display every 5 minutes.",platform_side:"Platform side",platform_side_auto:"Auto (1 = right, 2 = left)",platform_side_helper:"Default follows Wiener Linien signage (platform 2 on the left, otherwise right). Override manually if needed.",platform_side_left:"Always left",platform_side_requires:"Requires “Show platform”.",platform_side_right:"Always right",section_display:"Display",section_display_hint:"LED panel",section_header_hint:"Edit on the bar",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a white chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a white chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_pill:"Show line badge",show_line_pill_helper:"Renders the line code as a filled badge in the line colour rather than plain text.",show_platform:"Show platform",show_station_name:"Show station name",show_unit:"Show the “min” unit",show_unit_helper:'Trail each countdown number with a small amber "min" caption.',size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_default:"Default",station_bg_white:"White",style:"Style",style_classic:"Classic",style_pixel:"Dot matrix",style_warm:"Warm",text:"Sign text",text_helper:"E.g. name of the next station.",wheelchair_race:"Wheelchair race (easter egg)"},aria_dismiss_message:"Dismiss scrolling message",aria_start_race:"Start accessibility race",at_platform:"Arriving",barrier_free_title:"Step-free access",betriebsschluss:"End of service",countdown_minutes:"{n} minutes",departures_list:"Upcoming departures",dir_both:"Both",dir_h:"Outbound",dir_h_short:"H",dir_r:"Return",dir_r_short:"R",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",gleis:"PLATF.",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",no_entity:"No stop selected",race_finished:"Accessibility race finished",race_starting_in:"Race starting in {n}",race_winner_announce:"Wheelchair {n} wins the accessibility race",stale_feed:"No live data",steig:"BAY",unit_min:"min",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",version_update:"Retro card updated to v{v} — please reload",via_prefix:"VIA"},Be={no_entity:"No stop selected",no_data:"No departures",no_data_wrong_direction:"No departures in this direction",no_data_wrong_line:"No departures for this line",betriebsschluss:"End of service",stale_feed:"No live data",dir_h:"Outbound",dir_r:"Return",dir_h_short:"H",dir_r_short:"R",gleis:"GLEIS",steig:"BAY",col_line:"LINE",col_dest:"DIRECTION",col_step_free:"STEP-FREE",col_cd:"ARRIVAL",version_update:"Flap card updated to v{v} — please reload",version_reload:"Reload",version_reload_stuck:"Reload didn't pick up the new version. Close this browser tab and reopen the dashboard, or clear your browser's site data for Home Assistant.",entity_missing:"Sensor {entity} no longer exists. Pick a different sensor in the entity selector above.",departures_list:"Upcoming departures",at_platform:"Arriving",countdown_minutes:"{n} minutes",barrier_free_title:"Step-free access",not_barrier_free_title:"Step-free access not available",unit_min:"min",dir_both:"Both",header:{icon_exit:"Exit",icon_exit_access:"Step-free exit",icon_wc:"Toilet",icon_escalator:"Escalator",icon_elevator:"Elevator",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_door_open:"Open door",icon_mdi_stairs:"Stairs"},editor:{accessibility_only:"Only show step-free departures",accessibility_only_requires:"Requires “Show wheelchair badge”.",chips:"Extra labels",chips_helper:"Short labels after the icons (e.g. platform or line numbers). Up to 6, 16 characters each.",date_format:"Date format",date_format_helper:"Example: d.m.Y → 25.05.2026. Tokens: d j (day), m n (month), Y y (year), D l (weekday), M F (month name). Anything else passes through unchanged.",entities:"Stops",exit:"Exit icon",extra_icons:"Extra icons",extra_icons_helper:"Pick up to 3 MDI icons per side. Type to search the catalog, or paste an mdi: key.",header_exit_accessible:"Step-free exit",header_exit_none:"None",header_exit_regular:"Exit",hide_attribution:"Hide data source",hide_attribution_helper:"When on, the CC-BY credit at the bottom of the card is hidden. The Wiener Linien Open Government Data licence requires visible attribution unless you keep the credit elsewhere on the dashboard.",housing:"Show cabinet frame",housing_helper:"Wraps the board in the cabinet with a soft inset bevel and drop shadow. Cabinet colour follows your HA theme (cream on light, dark on dark). When off, the board sits flush against the dashboard.",icon_mdi_door_open:"Open door",icon_mdi_exit_run:"Exit (running person)",icon_mdi_exit_to_app:"Exit (door)",icon_mdi_stairs:"Stairs",max_rows:"Number of rows",max_rows_helper:"How many departures to show on the board (1–8). Merged across all stops, sorted by countdown.",section_display:"Display",section_display_hint:"Split-flap board",section_station_helper:"The coloured band with the station name + clock at the top of the board.",show_accessibility:"Show step-free tile",show_accessibility_helper:"Add a wheelchair pictogram tile next to step-free departures.",show_clock:"Show clock chip",show_clock_helper:"Current time (HH:MM) as a cream chip at the innermost edge of this side.",show_date:"Show date chip",show_date_helper:"Current date as a cream chip next to the clock.",show_header:"Show station sign",show_header_helper:"Master switch. Per-side settings are kept.",show_line_column:"Show line column",show_line_column_helper:"Shows the column carrying the line code. Turn it off when the board only ever shows one line.",show_min_unit:'Show "min" caption',show_min_unit_helper:"Small label next to the countdown number, like real station boards.",show_platform:"Show platform / track",show_platform_helper:"Adds a per-row platform tile between the destination and the countdown. Only shown when at least one visible row has a platform value.",show_station_name:"Show station name",show_station_name_helper:"Coloured band with the station name and current time at the top of the card.",size:"Size",station_bg:"Station-name background",station_bg_black:"Black",station_bg_helper:"Default is the colour of the first tracked line (e.g. red for U1, orange for U3). On multi-line boards you can pick a specific line, or override with solid white or black.",station_bg_line:"First line",station_bg_white:"White",text:"Sign text",text_helper:"E.g. name of the next station.",walk_time_no_data:"No departures matched. Pick a direction or wait until the sensor reports lines."}},Ne={common:He,modern:Pe,retro:We,flap:Be};const Oe={de:Object.freeze({__proto__:null,common:Ce,default:Me,flap:De,modern:Le,retro:Re}),en:Object.freeze({__proto__:null,common:He,default:Ne,flap:Be,modern:Pe,retro:We})},qe=Oe.de??{};function je(e,t){const i=function(e,t){return e.split(".").reduce((e,t)=>{if(e&&"object"==typeof e&&t in e)return e[t]},t)}(e,t);return"string"==typeof i?i:void 0}function Ue(e,t,i){const r=function(e){return"en"===((e.configLanguage||e.hassLanguage||"de").split(/[-_]/)[0]??"de")?"en":"de"}(t);let n=je(e,Oe[r]??qe);if(void 0===n&&(n=je(e,qe)),void 0===n)return e;if(i)for(const[e,t]of Object.entries(i))n=n.replace(`{${e}}`,String(t));return n}function Ke(e,t,i="banner"){if(!e)return V;if(function(e){if(!e)return!1;try{return"1"===window.sessionStorage?.getItem(`wl-reload-attempted-${e}`)}catch{return!1}}(e)){const e=t("version_reload_stuck");return K`
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
  `}const Ie={retro:!1},Fe={retro:!1},Ve={retro:"regular"},Ge={retro:!1},Ye={retro:"default"},Ze={retro:!0},Xe=2,Qe={exit:{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"left",labelKey:"icon_exit",shapes:()=>I`
      <polygon points="31.29 0 18.99 0 13.99 0 13.99 5 13.99 10.31 18.99 10.31 18.99 5 31.29 5 31.29 24.04 18.99 24.04 18.99 18.44 13.99 18.44 13.99 24.04 13.99 29.04 18.99 29.04 31.29 29.04 36.29 29.04 36.29 24.04 36.29 5 36.29 0 31.29 0"/>
      <polygon points="24.22 12.38 7.65 12.38 12.5 7.53 6.85 7.53 0 14.37 6.85 21.23 12.51 21.23 12.51 21.23 7.66 16.38 24.22 16.38 24.22 12.38"/>
    `},"exit-access":{kind:"svg",viewBox:"0 0 36.29 29.04",glyphPointsTo:"right",labelKey:"icon_exit_access",shapes:()=>I`
      <polygon points="17.3 18.73 17.3 24.04 5 24.04 5 5 17.3 5 17.3 10.59 22.3 10.59 22.3 5 22.3 0 17.3 0 5 0 0 0 0 5 0 24.04 0 29.04 5 29.04 17.3 29.04 22.3 29.04 22.3 24.04 22.3 18.73 17.3 18.73"/>
      <circle cx="9.97" cy="8.73" r="1.05"/>
      <path d="M9.04,10.69h0v4.12h0c0,.36.5.66,1.12.66h3.48l1.2,2.87h1l-1.2-2.87-.39-.93h-2.97v-1.47h2.32s-.09-.68-.58-.68h-1.74v-1.7h0c0-.36-.5-.66-1.12-.66s-1.12.29-1.12.66Z"/>
      <path d="M11.67,18.74c1.04-.58,1.78-1.63,1.91-2.87h-.72c-.18,1.49-1.45,2.64-2.98,2.64-1.66,0-3.01-1.35-3.01-3.01,0-1.21.71-2.24,1.74-2.72v-.77c-1.43.52-2.45,1.89-2.45,3.49,0,2.05,1.67,3.72,3.72,3.72h6.32v-.48h-4.53Z"/>
      <polygon points="29.44 7.81 23.79 7.81 23.79 7.81 28.63 12.66 17.3 12.66 17.3 16.66 28.64 16.66 23.79 21.51 29.45 21.51 36.29 14.66 29.44 7.81"/>
    `},wc:{kind:"text",text:"WC",labelKey:"icon_wc"},escalator:{kind:"svg",viewBox:"0 0 36.74 28.3",labelKey:"icon_escalator",shapes:()=>I`
      <polygon points="27.05 0 27.05 3.08 23.69 3.08 23.69 6.17 20.32 6.17 20.32 9.25 16.96 9.25 16.96 12.33 13.64 12.33 13.64 15.42 10.28 15.42 10.28 18.5 6.91 18.5 6.91 22.14 0 22.14 0 28.3 7.97 28.3 30.42 6.17 36.74 6.17 36.74 0 27.05 0"/>
    `},elevator:{kind:"svg",viewBox:"0 0 24.01 36.69",labelKey:"icon_elevator",shapes:()=>I`
      <path d="M14.82,19.29h-5.63c-.37,0-.68.3-.68.68v5.15c0,.37.3.68.68.68s.68-.3.68-.68v-4.48h.42v12.32c0,.37.3.68.68.68s.68-.3.68-.68v-7.42h.73v7.42c0,.37.3.68.68.68s.68-.3.68-.68v-12.32h.42v4.48c0,.37.3.68.68.68s.68-.3.68-.68v-5.15c0-.37-.3-.68-.68-.68Z"/>
      <circle cx="12" cy="17.3" r="1.57"/>
      <path d="M22.6,14.1v21.18H1.41V14.1h21.18M24.01,12.68H0v24.01h24.01V12.68h0Z"/>
      <polygon points="11.11 4.94 6.17 0 1.23 4.94 1.23 7.6 5.23 3.61 5.23 11.48 7.11 11.48 7.11 3.61 11.11 7.6 11.11 4.94"/>
      <polygon points="12.9 6.54 17.84 11.48 22.78 6.54 22.78 3.87 18.78 7.87 18.78 0 16.9 0 16.9 7.87 12.9 3.87 12.9 6.54"/>
    `}},Je=["mdi:exit-run","mdi:exit-to-app","mdi:door-open","mdi:stairs"],et={"mdi:exit-run":{labelKey:"icon_mdi_exit_run",glyphPointsTo:"right"},"mdi:exit-to-app":{labelKey:"icon_mdi_exit_to_app",glyphPointsTo:"right"},"mdi:door-open":{labelKey:"icon_mdi_door_open"},"mdi:stairs":{labelKey:"icon_mdi_stairs"}};function tt(e,t){const i=Qe[e];if("text"===i.kind)return K`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
      <span class="retro-station-header__monogram" aria-hidden="true">${i.text}</span>
    </span>`;const r=t.flipX?"retro-station-header__icon retro-station-header__icon--flip-x":"retro-station-header__icon";return K`<span class="retro-station-header__tile" role="img" aria-label=${t.ariaLabel}>
    <svg
      class=${r}
      viewBox=${i.viewBox}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >${i.shapes()}</svg>
  </span>`}function it(e,t){return"boolean"==typeof e?e:t}const rt=new Set(["small","medium","regular"]),nt=new Set(["default","white","black"]),at=new Set(["classic","warm","pixel"]),ot=new Set(["auto","left","right"]),st=new Set(["none","regular","accessible",...Je]);function lt(e){if(!e||"object"!=typeof e)return;const t=e,i=st.has(t.exit)?t.exit:"none";let r;if("string"==typeof t.text){const e=t.text.trim().slice(0,64);e&&(r=e)}const n=!0===t.show_wc,a=!0===t.show_escalator,o=!0===t.show_elevator,s=!0===t.show_clock,l=!0===t.show_date;let c,d,h;if("string"==typeof t.date_format){const e=t.date_format.slice(0,32);e&&(c=e)}if(Array.isArray(t.chips)){const e=t.chips.filter(e=>"string"==typeof e).map(e=>e.trim().slice(0,16)).filter(e=>e.length>0).slice(0,6);e.length>0&&(d=e)}if(Array.isArray(t.extra_icons)){const e=t.extra_icons.filter(e=>"string"==typeof e).map(e=>e.trim()).filter(e=>/^[a-z0-9_-]+:[a-z0-9_-]+$/i.test(e)&&e.length<=64).slice(0,3);e.length>0&&(h=e)}if(!("none"!==i||void 0!==r||n||a||o||s||l||void 0!==d||void 0!==h))return;const p={};return"none"!==i&&(p.exit=i),void 0!==r&&(p.text=r),n&&(p.show_wc=!0),a&&(p.show_escalator=!0),o&&(p.show_elevator=!0),s&&(p.show_clock=!0),l&&(p.show_date=!0),void 0!==c&&(p.date_format=c),void 0!==d&&(p.chips=d),void 0!==h&&(p.extra_icons=h),p}function ct(e){if(!e||"object"!=typeof e)return;const t={};for(const[i,r]of Object.entries(e)){const e="number"==typeof r?r:"string"==typeof r?Number(r):NaN;if(!Number.isFinite(e)||e<0||e>120){console.warn(`[wiener-linien-austria] walk_times["${i}"] = ${JSON.stringify(r)} is not a finite number in 0..120 — dropping`);continue}const n=i.split("|"),a=n.length>=3?`${n[0]}|${n[1]}`:i,o=Math.round(e),s=t[a];t[a]=void 0===s?o:Math.max(s,o)}return Object.keys(t).length?t:void 0}const dt=new Set(["type","entity","direction","line","show_platform","platform_side","show_station_name","station_bg","size","style","flicker","wheelchair_race","accessibility_only","message_ticker","message_text","walk_times","show_header","header_left","header_right","show_line_pill","line_pill","line_stripe","housing","show_unit"]);function ht(e){const t="R"===e.direction?"R":"H",i=rt.has(e.size)?e.size:Ve.retro,r=nt.has(e.station_bg)?e.station_bg:Ye.retro,n=at.has(e.style)?e.style:"classic",a=function(e,t){const i={};if(!e||"object"!=typeof e)return i;for(const[r,n]of Object.entries(e))t.has(r)||(i[r]=n);return i}(e,dt);return{...a,type:e.type||"custom:wiener-linien-austria-retro-card",entity:"string"==typeof e.entity&&e.entity.startsWith("sensor.")?e.entity:void 0,direction:t,line:"string"==typeof e.line&&e.line?e.line:void 0,show_platform:it(e.show_platform,Ze.retro),platform_side:ot.has(e.platform_side)?e.platform_side:"auto",show_station_name:it(e.show_station_name,Ie.retro),station_bg:r,size:i,style:n,flicker:!0===e.flicker,wheelchair_race:!0===e.wheelchair_race,accessibility_only:!0===e.accessibility_only,message_ticker:!0===e.message_ticker,message_text:"string"==typeof e.message_text&&e.message_text.trim()?e.message_text.slice(0,160):void 0,walk_times:ct(e.walk_times),show_header:!0===e.show_header,header_left:lt(e.header_left),header_right:lt(e.header_right),show_line_pill:void 0!==e.show_line_pill?!0===e.show_line_pill:!0===e.line_pill,line_stripe:!0===e.line_stripe,housing:it(e.housing,Fe.retro),show_unit:it(e.show_unit,Ge.retro)}}function pt(e,t,i={},r="var(--primary-color)"){const n=e.toUpperCase();if(void 0!==t[n])return{background:t[n]};if(/^N\d/.test(n))return{background:"#1b1464",color:"#fef200"};const a=i[e]??i[n];return a?.bg?a.fg?{background:`#${a.bg}`,color:`#${a.fg}`}:{background:`#${a.bg}`}:{background:r}}function ut(e,t){return`${e}|${t}`}function _t(e,t){if(!e.length)return t.full;const i=e.slice(0,3).join(" / "),r=e.length>3?" +"+(e.length-3):"";return`${t.short}: ${i}${r}`}function gt(e,t){if(!e)return[];const i=new Set;if(e.tracked_line_keys?.length){for(const r of e.tracked_line_keys){const[e,n]=r.split("|",2);e&&(t&&n!==t||i.add(e))}if(i.size>0)return[...i].sort()}for(const r of e.departures??[])t&&r.direction!==t||r.line&&i.add(r.line);return[...i].sort()}function mt(e,t){const{lines:i,direction:r,line_directions:n,walk_times:a,accessibility_only:o}=t,s=i&&i.length?new Set(i):null;return e.filter(e=>{if(s&&!s.has(e.line))return!1;const t=n?.[e.line]??r;if(t&&e.direction!==t)return!1;if(a){const t=a[ut(e.line,String(e.direction??""))];if("number"==typeof t&&e.countdown<t)return!1}return!(o&&!e.barrier_free)})}function ft(e){if(!e)return[];const t=[];for(const[i,r]of Object.entries(e.states??{})){if(!i.startsWith("sensor."))continue;const e=r?.attributes??{};"number"==typeof e.diva&&(Array.isArray(e.departures)&&e.next_by_line&&"object"==typeof e.next_by_line&&t.push(i))}return t.sort(),t}const wt="wl-austria-fonts";function bt(e){return String(e).padStart(2,"0")}function yt(e,t,i){if(!e||!t)return null;const r=Date.parse(e);return Number.isFinite(r)?function(e,t,i="de"){if(!t)return"";const r="en"===i?"en-GB":"de-AT",n=()=>e.toLocaleDateString(r,{weekday:"long"}),a=()=>e.toLocaleDateString(r,{weekday:"short"}),o=()=>e.toLocaleDateString(r,{month:"long"}),s=()=>e.toLocaleDateString(r,{month:"short"});let l="",c=0;for(;c<t.length;){const i=t[c];if("\\"===i&&c+1<t.length)l+=t[c+1],c+=2;else{switch(i){case"d":l+=bt(e.getDate());break;case"j":l+=String(e.getDate());break;case"D":l+=a();break;case"l":l+=n();break;case"m":l+=bt(e.getMonth()+1);break;case"n":l+=String(e.getMonth()+1);break;case"M":l+=s();break;case"F":l+=o();break;case"Y":l+=String(e.getFullYear());break;case"y":l+=bt(e.getFullYear()%100);break;case"H":l+=bt(e.getHours());break;case"G":l+=String(e.getHours());break;case"h":l+=bt((e.getHours()+11)%12+1);break;case"g":l+=String((e.getHours()+11)%12+1);break;case"i":l+=bt(e.getMinutes());break;case"s":l+=bt(e.getSeconds());break;default:l+=i??""}c++}}return l}(new Date(r),t,i):null}function vt(e,t,i,r,n){let a=V;if("regular"===e.exit||"accessible"===e.exit){const i="regular"===e.exit?"exit":"exit-access";a=tt(i,{ariaLabel:r(`header.${Qe[i].labelKey}`),flipX:Qe[i].glyphPointsTo!==t})}else if(e.exit&&function(e){return"string"==typeof e&&e in et}(e.exit)){const i=et[e.exit];a=function(e,t){const i=t.flipX?"retro-station-header__mdi retro-station-header__mdi--flip-x":"retro-station-header__mdi";return K`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${t.ariaLabel}>
    <ha-icon class=${i} icon=${e}></ha-icon>
  </span>`}(e.exit,{ariaLabel:r(`header.${i.labelKey}`),flipX:void 0!==i.glyphPointsTo&&i.glyphPointsTo!==t})}const o=e.text?K`<span class="retro-station-header__text">${e.text}</span>`:V,s=e=>tt(e,{ariaLabel:r(`header.${Qe[e].labelKey}`)}),l=e.show_wc?s("wc"):V,c=e.show_escalator?s("escalator"):V,d=e.show_elevator?s("elevator"):V,h=(e.extra_icons??[]).map(e=>K`<span class="retro-station-header__tile retro-station-header__tile--mdi" role="img" aria-label=${e}>
    <ha-icon class="retro-station-header__mdi" icon=${e}></ha-icon>
  </span>`),p=[...h].reverse(),u=(e.chips??[]).map(e=>K`<span class="retro-station-header__chip">${e}</span>`),_=[...u].reverse(),g=e.show_clock?function(e){if(!e)return null;const t=Date.parse(e);if(!Number.isFinite(t))return null;const i=new Date(t);return`${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`}(i):null,m=g?K`<span
        class="retro-station-header__chip retro-station-header__chip--clock"
      >
        <ha-icon
          class="retro-station-header__chip-icon"
          icon="mdi:clock-outline"
        ></ha-icon>
        <span>${g}</span>
      </span>`:V,f=e.show_date?yt(i,e.date_format??"d.m.Y",n):null,w=f?K`<span
        class="retro-station-header__chip retro-station-header__chip--date"
        >${f}</span
      >`:V;return"left"===t?K`${a}${o}${d}${c}${l}${h}${u}${w}${m}`:K`${m}${w}${_}${p}${l}${c}${d}${o}${a}`}const xt=[["A","A","B"],["B","B","A"],["A","B","B"],["B","A","A"],["A","B","A"],["B","A","B"]],kt=[100,250],$t=[200,500],St=[500,900],zt=[.25,.5,.75],At=[3,2.5,2.5];function Et(e){const t=(e,t)=>e+Math.random()*(t-e),i=Math.random()<.5?"A":"B",r=Math.random()<.3?"A"===i?"B":"A":i,n=xt.filter(e=>e[2]===r),a=n[Math.floor(Math.random()*n.length)],o=Math.random(),s=o<.4?t(kt[0],kt[1]):o<.75?t($t[0],$t[1]):t(St[0],St[1]),l=t(2400,2700),c=l+s,d=l*t(1.08,1.15),h=c*t(1.08,1.15),p="A"===i?d:h,u="B"===i?d:h,_="A"===i?l:c,g="B"===i?l:c,m=e.a,f=e.b,w=e.finishCqw,b=Math.max(m,f),y=Math.max(20,92-b),v=(e,t)=>{const i=b+zt[t]*y,r=a[t]===e,n=At[t];return o=.6,i+(r?n:-n)+(2*Math.random()-1)*o;var o},x=v("A",0),k=v("A",1),$=v("A",2),S=v("B",0),z=v("B",1),A=v("B",2),E=(e,t,i)=>{const r=w-i,n=e-.75*t;if(r<=0||n<=1)return Math.max(i+5,102);const a=i+.25*r*t/n;return Math.max(102,Math.min(135,a))},T=E(_,p,$),C=E(g,u,A),L=(e,t,i,r,n,a)=>{const o=[[0,.25,e,t],[.25,.5,t,i],[.5,.75,i,r],[.75,1,r,n]];for(const[e,t,i,r]of o){if(i>=w)return e*a;if(r>=w){return(e+(w-i)/(r-i)*(t-e))*a}}return Number.POSITIVE_INFINITY},R=L(m,x,k,$,T,p),D=L(f,S,z,A,C,u);return{winner:R<=D?"A":"B",winnerCrossT:Math.min(R,D),cssVars:{"--race-a-duration":`${p}ms`,"--race-b-duration":`${u}ms`,"--race-a-end":T-m+"cqw","--race-b-end":C-f+"cqw","--race-a-x-25":x-m+"cqw","--race-a-x-50":k-m+"cqw","--race-a-x-75":$-m+"cqw","--race-b-x-25":S-f+"cqw","--race-b-x-50":z-f+"cqw","--race-b-x-75":A-f+"cqw"}}}const Tt=o`
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
`,Ct=o`
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
`;function Lt(e,t,i){return K`
    <div class="wl-tabs" role="tablist">
      ${e.map((r,n)=>K`<button
          type="button"
          class="wl-tab"
          role="tab"
          id=${`wl-tab-${r.key}`}
          aria-selected=${t===r.key?"true":"false"}
          aria-controls=${`wl-panel-${r.key}`}
          tabindex=${t===r.key?"0":"-1"}
          @click=${()=>i(r.key)}
          @keydown=${t=>((t,r)=>{const n="ArrowRight"===t.key?1:"ArrowLeft"===t.key?-1:0;if(!n)return;t.preventDefault();const a=e[(r+n+e.length)%e.length];a&&i(a.key)})(t,n)}
        >
          ${r.label}
          <span class="wl-tab-underline" aria-hidden="true"></span>
        </button>`)}
    </div>
  `}function Rt(e,t){return K`
    <section class="wl-section">
      <header class="wl-section-header">
        <span class="wl-section-title">${e.title}</span>
        ${e.hint?K`<span class="wl-section-hint">${e.hint}</span>`:V}
      </header>
      <div class="wl-section-body">${t}</div>
    </section>
  `}function Dt(e){return Rt(e,K`<ha-form
      .hass=${e.hass}
      .data=${e.data}
      .schema=${e.schema}
      .computeLabel=${e.computeLabel}
      .computeHelper=${e.computeHelper}
      @value-changed=${t=>{t.stopPropagation(),e.onChange(t.detail.value)}}
    ></ha-form>`)}const Mt=be(class extends ye{constructor(e){if(super(e),e.type!==fe&&e.type!==me&&e.type!==we)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===F||t===V)return t;const i=e.element,r=e.name;if(e.type===fe){if(t===i[r])return F}else if(e.type===we){if(!!t===i.hasAttribute(r))return F}else if(e.type===me&&i.getAttribute(r)===t+"")return F;return ke(e),t}});function Ht(e){e.stopPropagation()}const Pt=[{key:"show_wc",icon:"mdi:human-male-female",labelKey:"show_wc_short"},{key:"show_escalator",icon:"mdi:escalator",labelKey:"show_escalator_short"},{key:"show_elevator",icon:"mdi:elevator",labelKey:"show_elevator_short"},{key:"show_clock",icon:"mdi:clock-outline",labelKey:"show_clock_short"},{key:"show_date",icon:"mdi:calendar",labelKey:"show_date_short"}],Wt=[{value:"regular",icon:"mdi:exit-run",labelKey:"header_exit_regular"},{value:"accessible",icon:"mdi:wheelchair-accessibility",labelKey:"header_exit_accessible"},...Je.map(e=>({value:e,icon:e,labelKey:et[e].labelKey})),{value:"none",icon:"mdi:close-circle-outline",labelKey:"header_exit_none"}];function Bt(e,t){const i=("header_left"===e.selected?e.left:e.right)??{},r=e.et("header_slot_empty"),n=(i,r)=>t.patch(e.selected,i,r);return K`
    <div class="wl-strip">
      <div class="wl-strip-bar" role="group" aria-label=${e.et("header_bar_aria")}>
        ${Nt("header_left",e,t,r)}
        ${Nt("header_right",e,t,r)}
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
            ${Wt.map(t=>{const r=(i.exit??"none")===t.value,a=e.et(t.labelKey);return K`<button
                type="button"
                class="wl-pict"
                aria-pressed=${r?"true":"false"}
                aria-label=${a}
                title=${a}
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
            maxlength="64"
            .value=${i.text??""}
            aria-label=${e.et("text")}
            placeholder=${e.et("text_placeholder")}
            @keydown=${Ht}
            @keyup=${Ht}
            @keypress=${Ht}
            @change=${e=>n("text",e.target.value.trim()||void 0)}
          />
        </div>

        <div class="wl-group">
          <span class="wl-label">${e.et("header_amenities")}</span>
          <div class="wl-tray">
            ${Pt.map(t=>{const r=Boolean(i[t.key]),a=e.et(t.labelKey);return K`<button
                type="button"
                class="wl-tray-btn"
                aria-pressed=${r?"true":"false"}
                aria-label=${a}
                @click=${()=>n(t.key,!r)}
              >
                <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
                ${a}
              </button>`})}
          </div>
          ${i.show_date?K`<input
                type="text"
                class="wl-text"
                maxlength="32"
                .value=${i.date_format??""}
                aria-label=${e.et("date_format")}
                placeholder=${e.et("date_format_placeholder")}
                @keydown=${Ht}
                @keyup=${Ht}
                @keypress=${Ht}
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
              @click=${()=>i("extra_icons",Ot(n,r))}
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
              @click=${()=>i("chips",Ot(r,n))}
            >
              <ha-icon icon="mdi:close" aria-hidden="true"></ha-icon>
            </button>
          </span>`)}
      </div>

      ${n.length<3?K`<ha-icon-picker
            .value=${Mt("")}
            .label=${t.et("add_icon")}
            @value-changed=${e=>{const t=e.detail?.value;t&&i("extra_icons",[...n,t].slice(0,3))}}
          ></ha-icon-picker>`:V}
      ${r.length<6?K`<input
            type="text"
            class="wl-text"
            maxlength="16"
            aria-label=${t.et("add_chip")}
            placeholder=${t.et("add_chip")}
            @keydown=${e=>{if(e.stopPropagation(),"Enter"!==e.key)return;const t=e.target,n=t.value.trim();n&&(i("chips",[...r,n].slice(0,6)),t.value="")}}
            @keyup=${Ht}
            @keypress=${Ht}
          />`:V}
    </div>
  `}(i,e,n)}
      </div>
    </div>
  `}function Nt(e,t,i,r){const n="header_left"===e?t.left:t.right,a=t.selected===e,o=function(e,t){const i=[];if(!e)return[{label:t,kind:"text"}];if(e.exit&&"none"!==e.exit){const t=Wt.find(t=>t.value===e.exit);i.push({label:"",icon:t?.icon??e.exit,kind:"icon"})}e.text&&i.push({label:e.text,kind:"text"});for(const t of Pt)e[t.key]&&i.push({label:"",icon:t.icon,kind:"icon"});for(const t of e.extra_icons??[])i.push({label:"",icon:t,kind:"icon"});for(const t of e.chips??[])i.push({label:t,kind:"chip"});return i.length||i.push({label:t,kind:"text"}),i}(n,r);return K`<button
    type="button"
    class=${ve({"wl-zone":!0,"wl-zone--selected":a,"wl-zone--right":"header_right"===e})}
    aria-pressed=${a?"true":"false"}
    aria-label=${t.et("header_left"===e?"header_left":"header_right")}
    @click=${()=>i.selectSide(e)}
  >
    <span class="wl-zone-tokens">
      ${o.map(e=>K`<span
          class=${ve({"wl-token":!0,"wl-token--chip":"chip"===e.kind})}
          >${e.icon?K`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}</span
        >`)}
    </span>
  </button>`}function Ot(e,t){const i=e.filter((e,i)=>i!==t);return i.length?i:void 0}const qt=120;function jt(e,t,i){const r=new Set;for(const n of e)n.direction===t&&(i&&n.line!==i||n.towards&&r.add(n.towards));return[...r].sort()}function Ut(e,t){const i=new Set;for(const r of e)t&&r.line!==t||"H"!==r.direction&&"R"!==r.direction||i.add(r.direction);return i}function Kt(e,t){return t.size>0?e.filter(e=>t.has(e)):e}function It(e,t,i,r){const n=function(e,t){return e?.states?.[t]?.attributes}(e,t.entity),a=!n,o=n?.stop_name||t.entity,s=n?.line_colors??{},l=e=>function(e,t,i={},r="var(--primary-color)"){return pt(e,t,i,r).background}(e,i.lineColorOverrides,s,"#5b6470"),c=function(e){if(e?.tracked_lines?.length)return[...e.tracked_lines].sort();const t=new Set;if(e?.lines_at_stop?.length)for(const i of e.lines_at_stop)t.add(i);for(const i of e?.departures??[])i.line&&t.add(i.line);return Array.from(t).sort()}(n),d=new Set(t.lines??[]),h=function(e){const t=[],i=new Set;for(const r of e?.departures??[]){const e=String(r.direction??""),n=`${r.line}|${e}|${r.towards}`;i.has(n)||(i.add(n),t.push({line:r.line,direction:e,towards:r.towards,type:r.type}))}return t.sort((e,t)=>e.line===t.line?e.towards.localeCompare(t.towards):e.line.localeCompare(t.line)),t}(n),p=new Map;for(const e of n?.departures??[])e.line&&e.type&&!p.has(e.line)&&p.set(e.line,e.type);const u=e=>({full:i.t("H"===e?"dir_h":"dir_r"),short:i.t("H"===e?"dir_h_short":"dir_r_short")});return K`
    <section class="wl-section">
      <header class="wl-section-header">
        ${i.total>1?K`<span class="wl-index" aria-hidden="true">${i.index}</span>`:V}
        <span class="wl-section-title">${o}</span>
      </header>
      <div class="wl-stop-body">
        ${a?function(e,t,i){return K`
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
        ${function(e,t,i,r){const{lines:n,picked:a,colorOf:o,typeByLine:s}=r,l=a.size?t.et("lines_selected").replace("{n}",String(a.size)).replace("{total}",String(n.length)):t.et("lines_empty_means_all");return K`
    <div class="wl-group">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("lines_label")}</span>
        ${n.length?K`<span class="wl-note">${l}</span>`:V}
      </div>
      ${n.length?K`<div class="wl-chips">
            ${n.map(r=>{const n=t.singleLine?a.has(r):0===a.size||a.has(r),l=function(e){switch(e){case Te:return"mdi:subway-variant";case"ptTram":return"mdi:tram";case"ptBusCity":case"ptBusNight":return"mdi:bus";default:return null}}(s.get(r));return K`<button
                type="button"
                class="wl-chip"
                style=${Ae({"--wl-chip-color":o(r)})}
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
  `}(t,i,r,{lines:c,picked:d,colorOf:l,typeByLine:p})}
        ${!a&&c.length?function(e,t){return!e.singleLine&&Kt(t.lines,t.picked).length>=2}(i,{lines:c,picked:d})?function(e,t,i,r){const{triplets:n,picked:a,lines:o,colorOf:s,dirStrings:l}=r,c=Kt(o,a),d=e.line_directions??{},h=e.direction??null,p=e=>d[e]??h,u=(t,r)=>{const n={};for(const e of c){const i=e===t?r:p(e);i&&(n[e]=i)}for(const[e,t]of Object.entries(d))c.includes(e)||(n[e]=t);i.setDirections(e.entity,{direction:null,lineDirections:n})};return K`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      ${c.map(e=>{const i=Ut(n,e),r=p(e),a=i.has("H"),o=i.has("R"),c=1===i.size,d=i=>t.et("per_line_direction_aria").replace("{line}",e).replace("{direction}",null===i?t.t("dir_both"):_t(jt(n,i,e),l(i)));return K`
          <div class="wl-override-row">
            <span class="wl-badge" style=${Ae({background:s(e)})}
              >${e}</span
            >
            <div class="wl-dirs">
              ${Ft({label:l("H").short,active:"H"===r||null===r&&c&&a,disabled:!a,compact:!0,title:jt(n,"H",e).join(" / ")||t.t("dir_h"),ariaLabel:d("H"),onClick:()=>u(e,"H")})}
              ${Ft({label:l("R").short,active:"R"===r||null===r&&c&&o,disabled:!o,compact:!0,title:jt(n,"R",e).join(" / ")||t.t("dir_r"),ariaLabel:d("R"),onClick:()=>u(e,"R")})}
              ${Ft({label:"",icon:"mdi:swap-horizontal",active:null===r&&!c,disabled:c,compact:!0,title:t.t("dir_both"),ariaLabel:d(null),onClick:()=>u(e,null)})}
            </div>
          </div>
        `})}
    </div>
  `}(t,i,r,{triplets:h,picked:d,lines:c,colorOf:l,dirStrings:u}):function(e,t,i,r){const{triplets:n,picked:a,lines:o,dirStrings:s}=r,l=Kt(o,a),c=1===l.length?l[0]:void 0,d=e.direction??null,h=Ut(n,c),p=h.has("H"),u=h.has("R"),_=1===h.size,g="H"===d||null===d&&_&&p,m="R"===d||null===d&&_&&u,f=null===d&&!_,w=t=>{const r={};for(const[t,i]of Object.entries(e.line_directions??{}))l.includes(t)||(r[t]=i);i.setDirections(e.entity,{direction:t,lineDirections:r})},b=e=>0===h.size||h.has(e)?_t(jt(n,e,c),s(e)):`${s(e).short}: ${t.et("direction_not_served")}`,y=!u&&l.length?t.et("direction_note_one_way").replace("{line}",l[0]??""):"";return K`
    <div class="wl-group">
      <span class="wl-label">${t.et("direction_label")}</span>
      <div class="wl-dirs">
        ${Ft({label:b("H"),active:g,disabled:!p,title:p?t.t("dir_h"):t.et("direction_unavailable"),onClick:()=>w("H")})}
        ${Ft({label:b("R"),active:m,disabled:!u,title:u?t.t("dir_r"):t.et("direction_unavailable"),onClick:()=>w("R")})}
        ${t.singleLine?V:Ft({label:t.t("dir_both"),active:f,disabled:_,title:_?t.et("direction_unavailable"):t.t("dir_both"),onClick:()=>w(null)})}
      </div>
      ${y?K`<span class="wl-note">${y}</span>`:V}
    </div>
  `}(t,i,r,{triplets:h,picked:d,lines:c,dirStrings:u}):V}
        ${a?V:function(e,t,i,r){const{attrs:n,picked:a,colorOf:o}=r,s=e.line_directions??{},l=e.direction??null,c=function(e){const t=new Map;for(const i of e?.departures??[]){const e=String(i.direction??""),r=ut(i.line,e);let n=t.get(r);n||(n={line:i.line,direction:e,type:i.type,termini:[]},t.set(r,n)),i.towards&&!n.termini.includes(i.towards)&&n.termini.push(i.towards)}const i=Array.from(t.values());return i.sort((e,t)=>e.line===t.line?e.direction.localeCompare(t.direction):e.line.localeCompare(t.line)),i}(n).filter(e=>{if(a.size>0&&!a.has(e.line))return!1;const t=s[e.line]??l;return!t||e.direction===t});return c.length?K`
    <div class="wl-group wl-divide">
      <div class="wl-group-head">
        <span class="wl-label wl-label--grow">${t.et("section_walk_time")}</span>
        <span class="wl-note">${t.et("walk_time_unit")}</span>
      </div>
      <span class="wl-note">${t.et("walk_time_hint")}</span>
      <div class="wl-walk-list">
        ${c.map(r=>{const n=ut(r.line,r.direction),a=e.walk_times?.[n],s=r.termini.join(" / "),l=t.et("walk_time_aria").replace("{line}",r.line).replace("{towards}",s),c=t=>{const r=(a??0)+t;i.setWalkTime(e.entity,n,r<1?null:Math.min(qt,r))};return K`
            <div class="wl-walk-row">
              <span class="wl-badge" style=${Ae({background:o(r.line)})}
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
                  ?disabled=${void 0===a}
                  aria-label=${t.et("walk_time_less_aria").replace("{line}",r.line)}
                  @click=${()=>c(-1)}
                >
                  <ha-icon icon="mdi:minus" aria-hidden="true"></ha-icon>
                </button>
                <input
                  type="number"
                  class="wl-step-value"
                  min=${1}
                  max=${qt}
                  step="1"
                  inputmode="numeric"
                  placeholder=${t.et("walk_time_placeholder")}
                  aria-label=${l}
                  .value=${Mt(void 0!==a?String(a):"")}
                  @keydown=${Ht}
                  @keyup=${Ht}
                  @keypress=${Ht}
                  @change=${t=>i.setWalkTime(e.entity,n,function(e,t){const i=e.trim(),r=""===i?NaN:Number(i);return""===i||Number.isFinite(r)||console.warn(`[wiener-linien-austria] walk-time "${e}" for ${t} is not a number — clearing`),Number.isFinite(r)&&r>0?Math.min(120,Math.round(r)):null}(t.target.value,`${e.entity}/${n}`))}
                />
                <button
                  type="button"
                  class="wl-step-btn"
                  ?disabled=${(a??0)>=qt}
                  aria-label=${t.et("walk_time_more_aria").replace("{line}",r.line)}
                  @click=${()=>c(1)}
                >
                  <ha-icon icon="mdi:plus" aria-hidden="true"></ha-icon>
                </button>
              </span>
            </div>
          `})}
      </div>
    </div>
  `:V}
// Lovelace editor for the Wiener Linien Austria retro card (v2 editor system).
(t,i,r,{attrs:n,picked:d,colorOf:l})}
      </div>
    </section>
  `}function Ft(e){return K`<button
    type="button"
    class=${ve({"wl-dir":!0,"wl-dir--compact":!!e.compact})}
    aria-pressed=${e.active?"true":"false"}
    aria-disabled=${e.disabled?"true":"false"}
    aria-label=${e.ariaLabel??e.label}
    title=${e.title}
    @click=${t=>{e.disabled?t.preventDefault():e.onClick()}}
  >
    ${e.icon?K`<ha-icon icon=${e.icon} aria-hidden="true"></ha-icon>`:e.label}
  </button>`}let Vt=class extends ce{constructor(){super(...arguments),this._tab="stops",this._headerSide="header_left",this._pendingDirectionFix=!1,this._onEntityChanged=e=>{if(e.stopPropagation(),!this._config)return;const t=e.detail.value.entity,i="string"==typeof t?t:void 0;if(i===this._config.entity)return;const r={...this._config,entity:i},n=this._availableDirections(i);1===n.size&&(r.direction=n.has("H")?"H":"R"),r.line=gt(this._attrs(i),r.direction)[0],this._commit(r)},this._computeLabel=e=>{const t=this.hass?.localize?.(`ui.panel.lovelace.editor.card.generic.${e.name}`);return t||this._i18n.et(e.name)},this._computeHelper=e=>{const{et:t}=this._i18n;if("message_text"===e.name&&!this._config?.message_ticker)return t("message_text_requires");if("platform_side"===e.name&&!this._config?.show_platform)return t("platform_side_requires");const i=`${e.name}_helper`,r=t(i);return r===i?void 0:r}}setConfig(e){this._config=ht(e)}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_tab")||e.has("_headerSide"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._config.entity;return!i||t.states[i]!==this.hass.states[i]}willUpdate(e){(e.has("_config")||e.has("hass"))&&this._scheduleDirectionAutocorrect()}get _i18n(){return function(e,t){const i={hassLanguage:t};return{t:t=>Ue(`${e}.${t}`,i),et:t=>{const r=`${e}.editor.${t}`,n=Ue(r,i);if(n!==r)return n;const a=`common.editor.${t}`,o=Ue(a,i);return o===a?t:o}}}("retro",this.hass?.language)}_attrs(e){return e?this.hass?.states?.[e]?.attributes:void 0}_commit(e){var t,i;this._config=e,t="config-changed",i={config:e},this.dispatchEvent(new CustomEvent(t,{detail:i,bubbles:!0,composed:!0}))}_patch(e){this._config&&this._commit(ht({...this._config,...e}))}get _stopView(){const e=this._config;return{entity:e.entity??"",lines:e.line?[e.line]:[],direction:e.direction,walk_times:e.walk_times}}get _stopCallbacks(){return{toggleLine:(e,t)=>{if(!this._config)return;const i={...this._config};i.line===t?delete i.line:i.line=t,this._commit(i)},setDirections:(e,t)=>{if(!this._config||null===t.direction)return;const i={...this._config,direction:t.direction},r=gt(this._attrs(i.entity),t.direction);i.line&&r.includes(i.line)||(i.line=r[0]),this._commit(i)},setWalkTime:(e,t,i)=>{if(!this._config)return;const r={...this._config.walk_times??{}};null===i?delete r[t]:r[t]=i;const n={...this._config};Object.keys(r).length?n.walk_times=r:delete n.walk_times,this._commit(n)}}}render(){if(!this._config)return V;const{et:e}=this._i18n;return K`
      <div class="wl-editor">
        ${Lt([{key:"stops",label:e("tab_stop")},{key:"display",label:e("tab_display")},{key:"tweaks",label:e("tab_tweaks")}],this._tab,e=>{this._tab=e})}
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
      ${e.entity?It(this.hass,this._stopView,{index:1,total:1,singleLine:!0,lineColorOverrides:{},t:t,et:i},this._stopCallbacks):V}
    `}_renderDisplay(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return K`
      ${Rt({title:t("section_header"),hint:t("section_header_hint")},K`
          <ha-form
            .hass=${this.hass}
            .data=${{show_header:e.show_header}}
            .schema=${[{name:"show_header",selector:{boolean:{}}}]}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${e=>{e.stopPropagation(),this._patch(e.detail.value)}}
          ></ha-form>
          ${e.show_header?Bt({left:e.header_left,right:e.header_right,selected:this._headerSide,et:t},{selectSide:e=>{this._headerSide=e},patch:(e,t,i)=>this._patchHeaderSide(e,t,i)}):V}
        `)}
      ${Dt({...i,title:t("section_station"),data:{show_station_name:e.show_station_name,station_bg:e.station_bg},schema:[{name:"show_station_name",selector:{boolean:{}}},{name:"station_bg",selector:{select:{mode:"dropdown",options:[{value:"default",label:t("station_bg_default")},{value:"white",label:t("station_bg_white")},{value:"black",label:t("station_bg_black")}]}}}]})}
      ${Dt({...i,title:t("section_display"),hint:t("section_display_hint"),data:{show_platform:e.show_platform,platform_side:e.platform_side,accessibility_only:e.accessibility_only},schema:[{name:"show_platform",selector:{boolean:{}}},{name:"platform_side",disabled:!e.show_platform,selector:{select:{mode:"dropdown",options:[{value:"auto",label:t("platform_side_auto")},{value:"left",label:t("platform_side_left")},{value:"right",label:t("platform_side_right")}]}}},{name:"accessibility_only",selector:{boolean:{}}}]})}
      ${Dt({...i,title:t("section_extras"),hint:t("section_extras_hint"),data:{message_ticker:e.message_ticker,message_text:e.message_text??"",wheelchair_race:e.wheelchair_race},schema:[{name:"message_ticker",selector:{boolean:{}}},{name:"message_text",disabled:!e.message_ticker,selector:{text:{}}},{name:"wheelchair_race",selector:{boolean:{}}}]})}
    `}_renderTweaks(){const e=this._config,{et:t}=this._i18n,i={hass:this.hass,computeLabel:this._computeLabel,computeHelper:this._computeHelper,onChange:e=>this._patch(e)};return K`
      ${Dt({...i,title:t("section_led_panel"),data:{size:e.size,style:e.style,show_unit:e.show_unit,show_line_pill:e.show_line_pill,line_stripe:e.line_stripe,housing:e.housing,flicker:e.flicker},schema:[{name:"size",selector:{select:{mode:"dropdown",options:[{value:"small",label:t("size_small")},{value:"medium",label:t("size_medium")},{value:"regular",label:t("size_regular")}]}}},{name:"style",selector:{select:{mode:"dropdown",options:[{value:"classic",label:t("style_classic")},{value:"warm",label:t("style_warm")},{value:"pixel",label:t("style_pixel")}]}}},{name:"show_unit",selector:{boolean:{}}},{name:"show_line_pill",selector:{boolean:{}}},{name:"line_stripe",selector:{boolean:{}}},{name:"housing",selector:{boolean:{}}},{name:"flicker",selector:{boolean:{}}}]})}
    `}_patchHeaderSide(e,t,i){if(!this._config)return;const r={...this._config[e]??{},[t]:i};void 0===i&&delete r[t],this._patch({[e]:r})}_availableDirections(e=this._config?.entity){const t=this._attrs(e),i=new Set;for(const e of t?.tracked_line_keys??[]){const[,t]=e.split("|",2);"H"!==t&&"R"!==t||i.add(t)}if(i.size>0)return i;for(const e of t?.departures??[])"H"!==e.direction&&"R"!==e.direction||i.add(e.direction);return i}_scheduleDirectionAutocorrect(){if(!this._config||this._pendingDirectionFix)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";this._config.direction!==t&&(this._pendingDirectionFix=!0,Promise.resolve().then(()=>{try{if(!this._config)return;const e=this._availableDirections();if(1!==e.size)return;const t=e.has("H")?"H":"R";if(this._config.direction===t)return;const i={...this._config,direction:t},r=gt(this._attrs(i.entity),t);i.line&&r.includes(i.line)||(i.line=r[0]),console.info(`[wiener-linien-austria-retro-card-editor] direction autocorrected to "${t}" for entity "${i.entity??""}" — only one direction has live data`),this._commit(i)}finally{this._pendingDirectionFix=!1}}))}static{this.styles=[Ct,Tt]}};e([_e({attribute:!1})],Vt.prototype,"hass",void 0),e([ge()],Vt.prototype,"_config",void 0),e([ge()],Vt.prototype,"_tab",void 0),e([ge()],Vt.prototype,"_headerSide",void 0),Vt=e([he("wiener-linien-austria-retro-card-editor")],Vt);const Gt=800,Yt=3e5;{const e=window;e.customCards=e.customCards??[],e.customCards.some(e=>"wiener-linien-austria-retro-card"===e.type)||e.customCards.push({type:"wiener-linien-austria-retro-card",name:"Wiener Linien Austria — Retro",description:"LED-Anzeige im Stil der Wiener-Linien-Stationen",preview:!0,getEntitySuggestion:(e,t)=>t.startsWith("sensor.")?"wiener_linien_austria"!==e?.entities?.[t]?.platform?null:{config:{type:"custom:wiener-linien-austria-retro-card",entity:t}}:null})}let Zt=class extends ce{constructor(){super(...arguments),this._versionMismatch=null,this._raceState="idle",this._countdownDigit=null,this._raceWinner=null,this._tickerActive=!1,this._tickerTimer=null,this._viaPhase="towards",this._viaTimer=null,this._anyViaInRows=!1,this._versionCheckDone=!1,this._fallbackWarned=!1,this._cachedEid=null,this._raceTimers=new Set,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._handleCardClick=()=>{if(this._tickerActive)return this._tickerActive=!1,void this._scheduleTicker(Yt);this._config?.wheelchair_race&&"idle"===this._raceState&&("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||(this._clearRaceTimers(),this._startRace()))},this._handleCardKeydown=e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleCardClick())},this._onTickerDone=()=>{this._tickerActive=!1,this._scheduleTicker(Yt)}}setConfig(e){if(!e||"object"!=typeof e)throw new Error("wiener-linien-austria-retro-card: config must be an object");if(void 0!==e.entity&&"string"!=typeof e.entity)throw new Error("wiener-linien-austria-retro-card: 'entity' must be a string");if("string"==typeof e.entity&&e.entity&&!e.entity.startsWith("sensor."))throw new Error(`wiener-linien-austria-retro-card: 'entity' must be in the sensor domain (got "${e.entity}")`);this._config=ht(e),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer(),this._raceState="idle",this._countdownDigit=null,this._countdownStartAt=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null,this._tickerActive=!1,this._fallbackWarned=!1,this._cachedEid=null}getCardSize(){return 2}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:2}}static getConfigElement(){return document.createElement("wiener-linien-austria-retro-card-editor")}static getStubConfig(e){const t=ft(e)[0]||"";let i="H";const r=e?.states?.[t]?.attributes?.departures;if(Array.isArray(r)){const e=r.some(e=>"H"===e.direction),t=r.some(e=>"R"===e.direction);!e&&t&&(i="R")}return{entity:t,direction:i,size:"small"}}connectedCallback(){super.connectedCallback(),function(){if("undefined"==typeof document)return;if(document.getElementById(wt))return;const e=document.createElement("style");e.id=wt,e.textContent='\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans";\n  src: url("/wiener-linien-austria/fonts/wl-sans-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Sans Condensed";\n  src: url("/wiener-linien-austria/fonts/wl-sans-condensed-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-regular.woff2") format("woff2");\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}\n@font-face {\n  font-family: "WL Mono";\n  src: url("/wiener-linien-austria/fonts/wl-mono-bold.woff2") format("woff2");\n  font-weight: 700;\n  font-style: normal;\n  font-display: swap;\n}\n',document.head.appendChild(e)}(),"undefined"!=typeof document&&document.fonts?.ready&&document.fonts.ready.then(()=>{document.fonts.check('700 16px "WL Mono"')||console.warn('[wiener-linien-austria-retro-card] "WL Mono" 700 not loaded — falling back to Courier New (less authentic). Check /wiener-linien-austria/fonts/ is served by the integration.')}).catch(e=>{console.warn("[wiener-linien-austria-retro-card] document.fonts.ready rejected",e)}),!this._versionCheckDone&&this.hass?.callWS&&(this._versionCheckDone=!0,this._checkCardVersion()),"idle"!==this._raceState&&(this._config?.wheelchair_race?this._armStateTransitions():(this._raceState="idle",this._clearRaceTimers())),this._config?.message_ticker&&this._config?.message_text&&this._scheduleTicker(Yt)}disconnectedCallback(){super.disconnectedCallback(),this._clearRaceTimers(),this._clearTickerTimer(),this._clearViaTimer()}shouldUpdate(e){if(!this._config)return!1;if(e.has("_config")||e.has("_versionMismatch")||e.has("_raceState")||e.has("_countdownDigit")||e.has("_raceWinner")||e.has("_tickerActive")||e.has("_viaPhase"))return!0;const t=e.get("hass");if(!t||!this.hass)return!0;const i=this._resolveEntity();return!!i&&t.states[i]!==this.hass.states[i]}updated(e){super.updated(e),this._anyViaInRows?this._armViaTimer():null!==this._viaTimer&&this._clearViaTimer()}willUpdate(e){if(!e.has("_config"))return;const t=e.get("_config"),i=!0===t?.wheelchair_race,r=!0===this._config?.wheelchair_race;r&&!i?(this._clearRaceTimers(),this._startRace()):!r&&i&&(this._clearRaceTimers(),this._raceState="idle",this._countdownStartAt=null,this._countdownDigit=null,this._raceEndAt=null,this._freezeEndAt=null,this._victoryEndAt=null,this._raceWinner=null);const n=!0===t?.message_ticker&&!!t?.message_text,a=!0===this._config?.message_ticker&&!!this._config?.message_text,o=t?.message_text!==this._config?.message_text;!a||n&&!o?!a&&n&&(this._clearTickerTimer(),this._tickerActive=!1):(this._tickerActive=!1,this._scheduleTicker(1500))}_t(e,t){return Ue(`retro.${e}`,{hassLanguage:this.hass?.language},t)}async _checkCardVersion(){try{this._versionMismatch=await async function(e,t,i){if(!e?.callWS)return null;try{const r=await e.callWS({type:t});if(r?.version&&r.version!==i)return r.version}catch{}return null}(this.hass,"wiener_linien_austria/retro_card_version","2.0.0")}catch(e){console.warn("[wiener-linien-austria-retro-card] version probe failed",e)}}_resolveEntity(){const e=this._config?.entity;if(e&&this.hass?.states?.[e])return this._cachedEid=e,e;if(this._cachedEid&&this.hass?.states?.[this._cachedEid])return this._cachedEid;const t=ft(this.hass)[0]??null;return t&&e&&!this._fallbackWarned&&(this._fallbackWarned=!0,console.warn(`[wiener-linien-austria-retro-card] configured entity "${e}" not in hass.states; falling back to "${t}"`)),this._cachedEid=t,t}_clearRaceTimers(){for(const e of this._raceTimers)clearTimeout(e);this._raceTimers.clear()}_scheduleRaceTimer(e,t){const i=setTimeout(()=>{this._raceTimers.delete(i),e()},t);this._raceTimers.add(i)}_scheduleRace(e){this._scheduleRaceTimer(()=>this._startRace(),e)}_clearTickerTimer(){null!==this._tickerTimer&&(clearTimeout(this._tickerTimer),this._tickerTimer=null)}_scheduleTicker(e){this._clearTickerTimer(),this._tickerTimer=setTimeout(()=>{this._tickerTimer=null,this._runTicker()},e)}_runTicker(){this._config?.message_ticker&&this._config?.message_text&&("idle"===this._raceState?"undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?this._scheduleTicker(Yt):this._tickerActive=!0:this._scheduleTicker(2e4))}_tickerDurationSeconds(e){return Math.min(40,Math.max(8,5+.18*e.length))}_armViaTimer(){null===this._viaTimer&&(this._viaTimer=setInterval(()=>{this._viaPhase="towards"===this._viaPhase?"via":"towards"},4e3))}_clearViaTimer(){null!==this._viaTimer&&(clearInterval(this._viaTimer),this._viaTimer=null),this._viaPhase="towards"}_startRace(){if(!this._config?.wheelchair_race)return;if("undefined"!=typeof window&&window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return void this._scheduleRace(this._nextRaceDelay());if(this._currentBarrierFreeCount()<2)return void this._scheduleRace(this._nextRaceDelay());if(this._tickerActive)return void this._scheduleRace(this._nextRaceDelay());const{winnerCrossT:e}=this._randomizeRaceParams(),t=Date.now();this._raceState="countdown",this._countdownStartAt=t,this._countdownDigit=3,this._raceEndAt=t+2400+e+150,this._freezeEndAt=this._raceEndAt+1500,this._victoryEndAt=this._freezeEndAt+4e3,this._scheduleCountdownTick()}_scheduleCountdownTick(){if("countdown"!==this._raceState||null===this._countdownStartAt)return;const e=Date.now(),t=e-this._countdownStartAt;if(t>=2400)return void this._beginRacing();const i=Math.max(1,Math.min(3,3-Math.floor(t/Gt)));this._countdownDigit!==i&&(this._countdownDigit=i);const r=this._countdownStartAt+(Math.floor(t/Gt)+1)*Gt,n=Math.max(50,r-e);this._scheduleRaceTimer(()=>this._scheduleCountdownTick(),n)}_beginRacing(){this._raceState="racing",this._countdownDigit=null,this._countdownStartAt=null,this._armStateTransitions()}_measureRaceStartPositions(){const e=this.shadowRoot?.querySelector(".retro");if(!e)return null;const t=e.getBoundingClientRect();if(t.width<=0)return null;const i=this.shadowRoot?.querySelectorAll(".retro-row .retro-wheelchair");if(!i||i.length<2)return null;const r=i[0],n=i[1];if(!r||!n)return null;const a=r.getBoundingClientRect(),o=n.getBoundingClientRect(),s=a.left-t.left,l=o.left-t.left,c=100-("small"===this._config?.size?10:14)/t.width*100-a.width/t.width*100;return{a:s/t.width*100,b:l/t.width*100,finishCqw:c}}_randomizeRaceParams(){const e=this._measureRaceStartPositions(),t=Et({a:e?.a??0,b:e?.b??0,finishCqw:e?.finishCqw??96});this._raceWinner=t.winner;for(const[e,i]of Object.entries(t.cssVars))this.style.setProperty(e,i);return{winnerCrossT:t.winnerCrossT}}_armStateTransitions(){this._clearRaceTimers();const e=Date.now();switch(this._raceState){case"idle":return;case"countdown":return void(null!==this._countdownStartAt&&this._scheduleCountdownTick());case"racing":return void(null!==this._raceEndAt&&this._scheduleRaceTimer(()=>{this._raceState="freeze",this._raceEndAt=null,this._armStateTransitions()},Math.max(0,this._raceEndAt-e)));case"freeze":return void(null!==this._freezeEndAt&&this._scheduleRaceTimer(()=>{this._raceState="victory",this._freezeEndAt=null,this._armStateTransitions()},Math.max(0,this._freezeEndAt-e)));case"victory":return void(null!==this._victoryEndAt&&this._scheduleRaceTimer(()=>{this._raceState="idle",this._victoryEndAt=null,this._config?.wheelchair_race&&this._scheduleRace(this._nextRaceDelay())},Math.max(0,this._victoryEndAt-e)));default:{const e=this._raceState;throw new Error(`unhandled race state: ${String(e)}`)}}}_nextRaceDelay(){return 6e4+12e4*Math.random()}_currentBarrierFreeCount(){if(!this._config)return 0;const e=this._resolveEntity();if(!e||!this.hass)return 0;const t=this.hass.states[e]?.attributes??{};return mt(Array.isArray(t.departures)?t.departures:[],{direction:this._config.direction,lines:this._config.line?[this._config.line]:void 0,walk_times:this._config.walk_times,accessibility_only:this._config.accessibility_only}).slice(0,2).filter(e=>e.barrier_free).length}render(){if(!this._config)return V;const e=this._config,t=this._resolveEntity(),i=t?this.hass?.states?.[t]?.attributes??{}:{},r=Array.isArray(i.departures)?i.departures:[],n=mt(r,{direction:e.direction,lines:e.line?[e.line]:void 0,walk_times:e.walk_times,accessibility_only:e.accessibility_only}),a=n.slice(0,Xe),o=a.find(e=>e.platform)?.platform??null,s=e.show_platform?o:null;let l;switch(e.platform_side){case"left":l=!0;break;case"right":l=!1;break;default:l="2"===s}const c=(a[0]?.type??"")===Te,d=this._t(c?"gleis":"steig"),h=i.stop_name||i.friendly_name||"",p=e.show_station_name&&!!h?this._renderStationName(h,n,r,e.station_bg,i.line_colors??{},e.line):V,u=e.show_header?function(e){const{left:t,right:i,serverTime:r,t:n,lang:a}=e;return t||i?K`
    <div class="retro-station-header" role="group">
      <div class="retro-station-header__side retro-station-header__side--left">
        ${t?vt(t,"left",r,n,a):V}
      </div>
      <div class="retro-station-header__side retro-station-header__side--right">
        ${i?vt(i,"right",r,n,a):V}
      </div>
    </div>
  `:V}({left:e.header_left,right:e.header_right,serverTime:i.server_time,t:e=>this._t(e),lang:this.hass?.language}):V,_=e.wheelchair_race&&"countdown"===this._raceState,g=e.wheelchair_race&&"racing"===this._raceState,m=e.wheelchair_race&&"freeze"===this._raceState,f=e.wheelchair_race&&"victory"===this._raceState,w=e.wheelchair_race&&"idle"===this._raceState||this._tickerActive,b="A"===this._raceWinner?1:"B"===this._raceWinner?2:null;this._anyViaInRows=a.some(e=>!!e.via);const y={retro:!0,"retro--gleis-left":!!s&&l,"retro--gleis-right":!!s&&!l,"retro--no-gleis":!s,[`retro--size-${e.size}`]:"regular"!==e.size,[`retro--style-${e.style}`]:"classic"!==e.style,"retro--flicker":e.flicker,"retro--race-countdown":_,"retro--race-active":g,"retro--race-freeze":m,"retro--race-victory":f,"retro--clickable":w,"retro--line-pill":e.show_line_pill,"retro--line-stripe":e.line_stripe,"retro--housing":e.housing},v=w?{role:"button",tabindex:"0","aria-label":this._tickerActive?this._t("aria_dismiss_message"):this._t("aria_start_race")}:{};return K`
      <ha-card style="padding:0;overflow:hidden;">
        <div
          class=${ve(y)}
          role=${v.role??V}
          tabindex=${v.tabindex??V}
          aria-label=${v["aria-label"]??V}
          @click=${this._handleCardClick}
          @keydown=${w?this._handleCardKeydown:V}>
          ${Ke(this._versionMismatch,e=>this._t(e),"retro-banner")}
          ${u}
          ${p}
          <div class="retro-led">
            ${this._renderMain(t,a,r,s,d,i.server_time,i.line_colors??{},"number"==typeof i.stale_departures?i.stale_departures:0)}
            ${this._tickerActive&&e.message_text?K`<div class="retro-ticker" role="status" aria-live="polite">
                  <div
                    class="retro-ticker-text"
                    style=${`animation-duration:${this._tickerDurationSeconds(e.message_text)}s`}
                    @animationend=${this._onTickerDone}
                  >
                    ${e.message_text}
                  </div>
                </div>`:V}
            ${_&&null!==this._countdownDigit?K`<div class="retro-countdown" role="status" aria-live="polite">
                  ${$e(this._countdownDigit,K`<span class="retro-countdown-digit" aria-hidden="true">${this._countdownDigit}</span>`)}
                  <span class="retro-victory-sr">
                    ${this._t("race_starting_in",{n:this._countdownDigit})}
                  </span>
                </div>`:V}
            ${_||g||m?K`<div class="retro-finish-line" aria-hidden="true"></div>`:V}
            ${f?K`<div class="retro-victory" role="status" aria-live="polite">
                  <div class="retro-victory-flag" aria-hidden="true"></div>
                  ${null!==b?K`<div class="retro-victory-winner" aria-hidden="true">
                        <ha-icon class="retro-winner-trophy" icon="mdi:trophy"></ha-icon>
                        <span class="retro-winner-num">${b}</span>
                      </div>`:V}
                  <span class="retro-victory-sr">
                    ${null!==b?this._t("race_winner_announce",{n:b}):this._t("race_finished")}
                  </span>
                </div>`:V}
          </div>
        </div>
      </ha-card>
    `}_renderMain(e,t,i,r,n,a,o,s){if(!e)return K`<div class="retro-empty" role="status" aria-live="polite">${this._t("no_entity")}</div>`;if(0===t.length){const e=this._config.direction,t=this._config.line,r=i.filter(t=>t.direction===e);let n="no_data";return 0===i.length&&s>0?n="stale_feed":0===i.length&&a?n="betriebsschluss":i.length>0&&0===r.length?n="no_data_wrong_direction":t&&r.length>0&&(n="no_data_wrong_line"),K`<div class="retro-empty" role="status" aria-live="polite">${this._t(n)}</div>`}return K`
      <ul class="retro-rows" role="list" aria-label=${this._t("departures_list")}>
        ${t.map((e,t)=>this._renderRow(e,t,o))}
      </ul>
      ${r?this._renderGleis(r,n):V}
    `}_renderRow(e,t,i){const r=Number.isFinite(e.countdown)?e.countdown:null,n=null!==r&&r<=0,a=e.line||"?",o=e.towards||"",s="string"==typeof e.via&&e.via.trim()?e.via.trim():null,l=null===r?this._t("no_data"):n?this._t("at_platform"):this._t("countdown_minutes",{n:String(r)}),c=e.barrier_free?this._t("barrier_free_title"):"",d=[a,o,s?`${this._t("via_prefix")} ${s}`:"",l,c].filter(Boolean).join(" — "),h=pt(a,{},i),p="var(--primary-color)"!==h.background,u=p?h.background:"var(--led-amber)",_=h.color??(p?"#fff":"var(--led-bg)"),g=Ae({"--row-i":String(t),"--retro-line-color":u,"--retro-line-fg":_}),m=!!s;return K`
      <li class="retro-row" style=${g} aria-label=${d}>
        <div class="retro-line" aria-hidden="true">
          <span class="retro-line__label">${a}</span>
        </div>
        <div class="retro-dest" aria-hidden="true">
          <span class="retro-dest-stack">
            <span class="retro-dest-text retro-dest-text--layout">${Ee(o)}</span>
            ${m?K`
                  <span
                    class=${ve({"retro-dest-text":!0,"retro-dest-text--absolute":!0,"retro-dest-text--visible":"towards"===this._viaPhase})}
                  >${Ee(o)}</span>
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
    `}_renderStationName(e,t,i,r,n,a){let o,s;if("white"===r)o="#fff",s="#000";else if("black"===r)o="#000",s="#fff";else{const e=t.length?t:i,r=a||e[0]?.line;if(r){const e=pt(r,{},n);o=e.background,s=e.color??"#fff","var(--primary-color)"===o&&(o="#fff",s="#000")}else o="#fff",s="#000"}return K`
      <div class="retro-station" style=${Ae({background:o,color:s})}>
        <div class="retro-station-name">${Ee(e)}</div>
      </div>
    `}static{this.styles=o`
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
      /* WL Mono is the subsetted TeX Gyre Cursor face shipped with
         this integration — Courier-metric so the Courier New stack is
         a clean fallback during the woff2 fetch window. The bold
         variant ships separately so weight: 700 picks up real glyphs
         instead of faux-bold synthesis. */
      font-family: "WL Mono", "Courier New", Courier, monospace;
      font-weight: 700;
      letter-spacing: 0.08em;
      overflow: hidden;
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
      /* <ul> for semantic departure list — reset UA list chrome. */
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .retro-row {
      display: grid;
      grid-template-columns: 2.5em 1fr auto;
      /* Baseline alignment — not center. Both grid cells render the
         same uppercase WL Mono at the same font-size, so aligning by
         alphabetic baseline makes the cap-tops line up automatically
         (by construction, not by tuning). Center alignment used to
         centre the cells' BOXES, but WL Mono's uppercase glyphs sit
         in the upper-middle of their line-box — so identical boxes
         centred geometrically still showed mismatched visible ink.
         Baseline alignment retires both empirical translateY hacks
         that used to live on the pill and its inner label. */
      align-items: baseline;
      gap: 12px;
      white-space: nowrap;
      /* Position context for the line-stripe ::before Tweak and the
         absolute via-cross-fade pair inside .retro-dest. */
      position: relative;
    }
    .retro-line {
      /* Default (no Tweak): plain amber text, left-aligned. The pill
         layout below kicks in only under .retro--line-pill so the
         pre-Tweak look is byte-identical. Center alignment matches
         the row's align-items: center so the line cell vertically
         lines up with the destination text and countdown digits. */
      font-weight: 400;
      text-align: left;
      transition: opacity 0.15s ease-out;
    }
    /* Line-pill Tweak — render the line code inside a filled rounded
       rectangle using --retro-line-color (resolved per row in JS).
       Structural decisions (NOT empirical magic numbers — see below
       for the history):
       1. align-items: baseline (inherited from .retro-row). Pill text
          shares its baseline with the destination text in the next
          grid cell; same font + same size means cap-tops line up by
          construction. No translateY needed.
       2. NO fixed height. Pill grows from symmetric em padding
          around its inner label, so the visual capsule is always
          centred top-to-bottom on the text. Previous height: 1em
          made the pill BOX drift relative to its visible glyph,
          which every per-em translateY hack was empirically fighting.
       3. NO transform optical-nudge. Earlier passes tried -0.05em,
          0, +0.03em on the pill and -0.04em, 0, +0.08em on the
          label; baseline alignment retires all of them.
       Padding 0.08em block / 0.4em inline is the design spec; em
       sizing lets medium / small variants inherit proportions
       automatically. */
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
      /* Kept as a render-time wrapper so the markup stays uniform
         across pill and non-pill modes (the renderer always emits
         the span — keying off it from --race-victory or future
         tweaks stays cheap). inline-block makes the span a valid
         transform target if a future tweak needs one; currently no
         transform is applied because baseline alignment on the
         grid row handles centring structurally. */
      display: inline-block;
    }
    .retro-dest {
      display: flex;
      align-items: center;
      gap: 0.35em;
      /* No overflow: hidden on the flex container itself — the
         destination-text stack carries its own overflow:hidden /
         text-overflow:ellipsis, and clipping at this level would
         shave the bottom off the wheelchair icon at the row's
         right edge. Keeping overflow visible lets the icon render
         in full while the text inside still ellipsises. */
      text-transform: uppercase;
      min-width: 0;
      transition: opacity 0.15s ease-out;
    }
    /* Stack the towards / via labels on top of each other. The
       --layout span occupies the row height (so the row never
       collapses on cross-fade); the two --absolute spans sit on top
       and swap visibility via --visible. Rows with no via payload
       skip the absolute pair entirely and render only the layout span,
       so existing dashboards are unaffected. */
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
      /* Sized but invisible while via-cross-fade is mounted — the two
         absolute siblings carry the painted text. A row without a via
         payload omits the absolute pair, so the layout span stays
         visible and renders the towards text directly. */
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
      /* Sized slightly smaller than 1em so the icon sits comfortably
         inside the row's line-height: 1 box with the row centred —
         a full-em icon was clipping at the bottom under the previous
         overflow:hidden + baseline-translate combo on smaller sizes. */
      --mdc-icon-size: 0.9em;
      width: 0.9em;
      height: 0.9em;
      color: inherit;
      filter: drop-shadow(0 0 6px rgb(var(--led-glow-rgb) / 0.7));
      /* Optical-centre correction. WL Mono is a Courier-derived face
         with a tall ascender / shallow descender, so uppercase glyphs
         (SIMMERING) sit in the upper-middle of their line-box. An
         icon centred in the line-box geometrically ends up visibly
         above the cap-height of the text next to it. Nudging the
         icon down ~0.12em lands its visual centre on the cap-height
         centre of the adjacent SIMMERING glyphs. */
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
      /* Holds the tabular-nums alignment for the digit while letting
         the unit sit at a smaller size next to it without throwing off
         the right-edge alignment of the column. */
      display: inline-block;
    }
    .retro-cd-unit {
      /* Small amber-caps unit ("min") trailing the countdown number.
         Tied to em so it tracks the row's font-size token. Hidden at
         narrow widths via a container query below — the row prefers
         to surrender the unit over the destination text when room is
         tight. The text-shadow inherited from .retro-rows is already
         the right glow, so no overrides here. */
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
      /* LED prep: countdown, racing, and the photo-finish freeze all
         share the same row-clearing + overflow-visible setup. */
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
    /* Message-ticker overlay — when \`message_ticker\` is on, this fills
       the LED panel every few minutes and scrolls \`message_text\`
       across once as a marquee, then removes itself (animationend → a
       JS handler clears _tickerActive). Opaque --led-bg plus the same
       substrate dot-pattern as .retro-led so the departures vanish
       cleanly and the panel material stays consistent. z-index 16
       keeps it below the countdown (18) / victory (20) AND below the
       pixel screen-door ::after (30), so in pixel style the scrolling
       text is dotted like the rest of the board. */
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
      /* Query container so the scroll keyframes can start the text one
         full panel-width off the right edge via 100cqw. */
      container-type: inline-size;
    }
    .retro-ticker-text {
      /* flex: none keeps the text's natural (over-wide) width — the
         parent's overflow:hidden clips it. The parent's align-items:
         center handles vertical centring, so the keyframes touch only
         translateX and never fight a translateY. */
      flex: none;
      white-space: nowrap;
      /* Match the departure rows: same amber, glow, size and uppercase
         board lettering. Font, weight and tracking inherit from .retro. */
      font-size: 1.9em;
      line-height: 1;
      color: var(--led-amber);
      text-shadow: 0 0 6px rgb(var(--led-glow-rgb) / 0.7);
      text-transform: uppercase;
      will-change: transform;
      animation-name: retroTickerScroll;
      animation-timing-function: linear;
      animation-iteration-count: 1;
      /* both → text waits off-screen-right before the run and rests
         off-screen-left after it, with no flash at the layout origin.
         animation-duration is set inline, scaled to message length. */
      animation-fill-mode: both;
    }
    @keyframes retroTickerScroll {
      /* Start one full panel-width off the right (100cqw), end one
         full text-width off the left (-100%). */
      from { transform: translateX(100cqw); }
      to   { transform: translateX(-100%); }
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
      /* +10% over the previous 41cqmin / 82px / 172px sizing so the
         trophy + lane number have more breathing room inside the LED
         ring without crowding the embossed numerals. */
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
    /* Lane number on the trophy cup. Coloured with --led-substrate (the
       same dot colour the rest of the panel uses for unlit pixels) so
       the digit reads as a hole punched out of the trophy's lit amber
       — matching the dotted-board / Punktmatrix aesthetic across all
       three style variants. No text-shadow / embossing: with the
       substrate-tone digit, any lit-edge highlight reads as a halo
       around a "missing pixel" hole, which is the wrong material. */
    .retro-winner-num {
      position: absolute;
      top: 44%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      text-align: center;
      font-family: "Arial Black", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 900;
      /* -10% from the previous 22cqmin so the digit sits inside the
         cup bowl rather than overflowing onto the trophy stem. */
      font-size: 20cqmin;
      line-height: 1;
      color: var(--led-substrate);
      letter-spacing: -0.04em;
      pointer-events: none;
    }
    /* Tighter on the small variant so trophy + number still fit. */
    .retro--size-small .retro-winner-trophy {
      --mdc-icon-size: 51cqmin;
    }
    .retro--size-small .retro-winner-num {
      /* -10% from the previous 19cqmin, same rationale as base. */
      font-size: 17cqmin;
      /* On small the badge hits its 82px min-width while the trophy
         icon scales down independently — so the cup ends up a touch
         higher in the badge than on regular/medium. Nudge the number
         up the same amount so it lands on the cup body, not below it. */
      top: 37%;
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
      transition: opacity 0.4s ease-out;
      /* Position context for the dotted-divider pseudo. The previous
         border-left: 1px hairline read as a CSS edge, not LED material.
         A 2 px-wide column painted with the same substrate radial-
         gradient as the panel renders the divider as missing pixels —
         i.e. an unlit column on the dot-matrix. Pitch + dot size + dot
         edge inherit from the same custom properties .retro-led uses
         (4 px classic, 3 px warm / pixel) so the column always lines
         up with the substrate behind it. */
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

    /* ----- Station header strip -----------------------------------
       A homage to the real Wiener Linien U-Bahn station signage —
       a black band above the orange station name with per-side
       exit / amenity icons + a destination label. Colours are
       hardcoded (#000 / #fff) on purpose: the original signage is
       intentionally black-and-white, the same authenticity rule the
       .retro-station rule above follows. Spacing flows through HA
       Design System tokens with px fallbacks per
       ha-portfolio-design (§ 4). */
    .retro-station-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #000;
      color: #fff;
      padding: var(--ha-space-2, 8px) var(--ha-space-3, 12px);
      gap: var(--ha-space-2, 8px);
      /* WL Sans Condensed is the subsetted TeX Gyre Heros Cn face —
         the condensed proportion matches real Wiener Linien station
         signage. Ships only at weight 700 (the only weight the
         signage uses); a regular-weight request would fall through
         to WL Sans regular, then the Apple system stack. */
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
                   BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                   Arial, sans-serif;
      font-weight: 700;
      /* 1.1em (up from 1em): more device pixels per glyph is the only
         lever that genuinely de-steps the small condensed signage text
         on every engine — CSS antialiasing can't. The whole strip is
         em-based (text, chips, tiles), so this one knob scales it all
         together. The retro--size-medium / -small variants below carry
         their own absolute em values and are unaffected. */
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
      /* Bumped from inherited 1em — WL Sans Condensed is ~25% narrower
         than the regular Apple-stack sans, so the sign text can scale
         up without crowding the amenity tiles next to it. Stays
         proportional with the retro--size-* tokens because the parent
         .retro-station-header's font-size scales (1em / 0.9em / 0.8em),
         and this multiplier compounds on top. */
      font-size: 1.2em;
      /* White-on-black signage text — render it with grayscale
         antialiasing instead of subpixel. On a dark strip subpixel AA
         fringes the glyph edges and blooms the condensed strokes
         heavier than drawn; grayscale keeps them crisp. Scoped to this
         element (NOT the strip) on purpose: the chips and WC monogram
         are black-on-white, the opposite polarity, and keep the
         default subpixel AA which renders dark-on-light more solidly.
         A WebKit/Blink-on-macOS + iOS lever only — the Android System
         WebView always uses grayscale AA, so it's a no-op there. */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .retro-station-header__tile {
      /* White SQUARE tile hosting the (black) glyph — mirrors the
         real Wiener Linien station signage where each icon sits on
         a small white square within the black header strip. The
         square aspect is non-negotiable per the reference photo;
         the inner SVG fits via preserveAspectRatio=meet so portrait
         glyphs (elevator) and landscape glyphs (exit, wc) both
         centre cleanly inside the same square.
         Default 0.12em padding suits the WL-traced glyphs and the
         WC monogram — their authored paths use the full viewBox so a
         small white margin matches the look of the real station-sign
         photos. The --mdi modifier overrides to a tighter padding
         (see rule below) because MDI icons carry their own viewBox
         padding internally. */
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
      /* MDI glyphs ship with ~10% internal viewBox padding baked
         into the icon set, so the default tile padding stacks on top
         and makes them look noticeably smaller than the WL-traced
         tiles next to them. Halving the tile padding to 0.06em
         compensates — the rendered glyph ends up the same visual
         weight as a WL-traced glyph in a default-padded tile. */
      padding: 0.06em;
    }
    .retro-station-header__icon {
      width: 100%;
      height: 100%;
      display: block;
      /* SVG default fill is black per spec, but be explicit so the
         tile's color: #000 propagates if a future glyph adopts
         fill=currentColor. */
      fill: currentColor;
    }
    .retro-station-header__icon--flip-x {
      transform: scaleX(-1);
    }
    .retro-station-header__mdi {
      /* MDI variant sibling to .retro-station-header__icon. ha-icon
         renders an inline SVG sized by the --mdc-icon-size token; we
         pin it to fill the tile's content box (1.4em tile − 2 ×
         0.06em padding = 1.28em). Color cascades from the tile's
         color: #000 via ha-icon's currentColor fill. */
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
      /* WC tile content. Tile is already flex-centred, so the span
         positions itself. font-size is 0.9em — em-tied so it
         scales with the parent header's em-scale (1em / 0.9em /
         0.8em via retro--size-* tokens), shrunk ~10 % from the
         original 1em so the W / C letterforms don't overpower the
         surrounding amenity glyphs (the WL signage WC monogram
         reads as a small, paired label, not a heavyweight chip).
         font-family + weight are declared explicitly (rather than
         relying on inheritance from .retro-station-header) so a
         future header-rule rewrite can't accidentally regress the
         letterforms back to a non-condensed face. */
      font-family: "WL Sans Condensed", "WL Sans", -apple-system,
                   BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
                   Arial, sans-serif;
      font-weight: 700;
      font-size: 0.9em;
      line-height: 1;
    }
    .retro-station-header__chip {
      /* Auxiliary text label — same height as the icon tiles
         (1.4em) but with dynamic width so short labels (platform
         numbers, line designators) sit in a snug white box and
         longer labels grow horizontally. Composes visually with the
         icon tiles next to it via the same height + colour scheme.
         Padding is horizontal-only — the flex-centred line shares
         vertical alignment with the icon glyphs on the same row.
         Font is WL Sans Condensed 700 — the SAME signage face as the
         destination text and WC monogram. The strip is a signage
         homage; one coherent typographic voice across the whole band
         reads "station sign", whereas a regular-width or lighter face
         reads "web UI element stuck onto a sign".
         No explicit font-size: chip inherits the parent header's
         em-scale (1em / 0.9em / 0.8em via retro--size-* tokens), so
         height: 1.4em resolves to the SAME pixel value as the icon
         tiles. Setting a different font-size here (e.g. 0.75rem)
         would produce visibly shorter chips next to the tiles
         because em is relative to the element's own font-size. */
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
      /* 700 — WL Sans Condensed ships only at 700, and that IS the
         intent: chips should read as solid signage, not as a lighter
         UI tier. Hierarchy on the strip comes from size and position
         (the destination text is condensed 1.2em), never from mixing
         weight or width onto the same band. */
      font-weight: 700;
      line-height: 1;
      /* Reset the 0.02em letter-spacing inherited from .retro-station-header
         — the tracked-out feel of the header text doesn't suit
         chip-style labels where width is dynamic and longer entries
         (Schlafzimmer, etc.) add up visibly. */
      letter-spacing: 0;
      white-space: nowrap;
    }
    /* Size-token alignment — match the .retro--size-* scale. */
    .retro--size-medium .retro-station-header {
      font-size: 0.9em;
      padding: 6px var(--ha-space-2, 8px);
    }
    .retro--size-small .retro-station-header {
      font-size: 0.8em;
      padding: 5px var(--ha-space-2, 8px);
    }
    /* Narrow-width reflow (WCAG 1.4.10 AA) — drop the destination
       label so the icons stay visible at a 320 px section-view
       column. Unnamed container query — matches the nearest
       inline-size container, which is .retro (the outer wrapper).
       The size containers on overlays are not ancestors of the
       header strip, so they don't interfere. */
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

    /* Accessibility: visible focus ring for keyboard users. */
    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--led-amber, #ffa000);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* First-paint stagger — LED rows cascade in on mount via
       per-row style="--row-i: N"; capped at 6 so long boards don't
       take ages to settle. Collapsed to instant by the
       prefers-reduced-motion catch-all below. */
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

    /* Optional clock chip inside the station-header strip. Renders
       as a base .retro-station-header__chip (white box, black text,
       condensed WL signage face) with a small clock glyph in front
       of the HH:MM digits. Inherits everything else from the chip
       rule — no font / weight / spacing override here, so it sits
       indistinguishably next to the other chips except for the
       leading icon. */
    .retro-station-header__chip--clock {
      gap: 0.25em;
    }
    .retro-station-header__chip-icon {
      /* MDI icon sized to the chip's cap height so it sits centred
         next to the digits. ha-icon ships an inline SVG controlled
         by --mdc-icon-size; pin it to 1em and let the chip's flex
         centring handle vertical alignment. */
      --mdc-icon-size: 1em;
      display: inline-flex;
      align-items: center;
      color: inherit;
      flex-shrink: 0;
    }

    /* Line-stripe Tweak — 4 px coloured bar at the left edge of each
       row in the line's resolved colour with a faint matching glow.
       --retro-line-color is the same var the line pill paints with, so
       the stripe always matches the pill (one source of truth). */
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

    /* Housing Tweak — wrap the LED panel in an outer dark frame with
       a soft inner highlight and a glass-reflection gradient over
       the display. Defaults off; existing dashboards keep their
       flush edge-to-edge look. */
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
    /* Glass reflection — a 30 % top gradient sitting OVER the LED
       content (z=2). 4 % white is subtle enough to not wash out the
       row text but reads as a real reflection on a glossy bezel. */
    .retro--housing .retro-led::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%);
      pointer-events: none;
      z-index: 2;
      border-radius: inherit;
    }
    /* Housing-on station header and station name plate also pick up
       the inner border-radius so the bezel corners look right. */
    .retro--housing .retro-station-header {
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    .retro--housing .retro-station:last-child,
    .retro--housing .retro-station-header:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
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
  `}};e([_e({attribute:!1})],Zt.prototype,"hass",void 0),e([ge()],Zt.prototype,"_config",void 0),e([ge()],Zt.prototype,"_versionMismatch",void 0),e([ge()],Zt.prototype,"_raceState",void 0),e([ge()],Zt.prototype,"_countdownDigit",void 0),e([ge()],Zt.prototype,"_raceWinner",void 0),e([ge()],Zt.prototype,"_tickerActive",void 0),e([ge()],Zt.prototype,"_viaPhase",void 0),Zt=e([he("wiener-linien-austria-retro-card")],Zt);export{Zt as WienerLinienAustriaRetroCard};
