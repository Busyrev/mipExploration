

class WebGLDescriber {

	constructor(context:WebGLRenderingContext) {
		try {
			this.officiallySupported = !!(<any>window)['WebGLRenderingContext'];

			if (!context) {
				return;
			}
			
			this.userAgent = navigator.userAgent;
			if (window.screen && typeof window.screen.width === 'number') {
				this.screenHeight = window.screen.height;
				this.screenWidth = window.screen.width;
			}

			this.detectVieoCard(context);

			this.version = context.getParameter(context.VERSION);
			this.shadingVesion = context.getParameter(context.SHADING_LANGUAGE_VERSION);

			this.maxVertexAttributes = context.getParameter(context.MAX_VERTEX_ATTRIBS);
			this.maxVertexUniformVectors = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS);
			this.maxVertexTextureImageUnits = context.getParameter(context.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
			this.maxVaryingVectors = context.getParameter(context.MAX_VARYING_VECTORS);

			this.maxFragmentUniformVectors = context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS);
			this.maxTextureImageUnits = context.getParameter(context.MAX_TEXTURE_IMAGE_UNITS);

			this.redBits = context.getParameter(context.RED_BITS);
			this.greenBits = context.getParameter(context.GREEN_BITS);
			this.blueBits = context.getParameter(context.BLUE_BITS);
			this.alphaBits = context.getParameter(context.ALPHA_BITS);
			this.depthBits = context.getParameter(context.DEPTH_BITS);
			this.stencilBits = context.getParameter(context.STENCIL_BITS);
			this.maxRenderbufferSize = context.getParameter(context.MAX_RENDERBUFFER_SIZE);
			let dims = context.getParameter(context.MAX_VIEWPORT_DIMS);
			this.maxViewportDims0 = dims['0'];
			this.maxViewportDims1 = dims['1'];

			this.maxTextureSize = context.getParameter(context.MAX_TEXTURE_SIZE);
			this.maxCubeMapTextureSize = context.getParameter(context.MAX_CUBE_MAP_TEXTURE_SIZE);
			this.maxCombinedTextureImageUnits = context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

			let attributes = context.getContextAttributes();

			this.attributesAlpha = attributes.alpha;
			this.attributesDepth = attributes.depth;
			this.attributesStencil = attributes.stencil;
			this.attributesAntialias = attributes.antialias;
			
			this.attributesPremultipliedAlpha = attributes.premultipliedAlpha;
			this.attributesPreserveDrawingBuffer = attributes.preserveDrawingBuffer;

			this.majorPerformanceCaveat = this.getMajorPerformanceCaveat();

			this.detectShaderPrecisionFormat(context);
			this.supportedExtensions = context.getSupportedExtensions();

			this.supported = true;
			this.detectError = false;
		} catch (e) {
			this.detectError = true;
		}
	}

	private getMajorPerformanceCaveat():string {
        //let canvas = $('<canvas />', { width : '1', height : '1' }).appendTo('body');
        let canvas = document.createElement('canvas');
        let opts = { failIfMajorPerformanceCaveat : true }
        let context = (canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts)) as WebGLRenderingContext;

        if (!context) {
            return 'yes';
            }

        if (context.getContextAttributes().failIfMajorPerformanceCaveat === undefined) {
            // If getContextAttributes() doesn't include the failIfMajorPerformanceCaveat
            // property, assume the browser doesn't implement it yet.
            return 'not_supported';
        }

        return 'no';
    }

	private detectVieoCard(context:WebGLRenderingContext):void {
		try {
			let extension = this.getExtension(context, 'WEBGL_debug_renderer_info');
			if (!extension) {
				this.videoCard = 'no WEBGL_debug_renderer_info extension found';
				return;
			}
			this.videoVendor = context.getParameter(extension.UNMASKED_VENDOR_WEBGL);
			this.videoCard = context.getParameter(extension.UNMASKED_RENDERER_WEBGL);
		} catch (e) {
			this.videoCard = 'detecting error';
		}
	}
	
	private getExtension(context:WebGLRenderingContext, name: string):any {
		if (!context) {
			return null;
		}
		try {
			let extension:any = context.getExtension(name);
			if (extension) {
				return extension;
			} else {
				for (let prefix of ['MOZ_', 'WEBKIT_']) {
					extension = context.getExtension(prefix + name);
					if (extension) {
						return extension;
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
		return null;
	}

	private detectShaderPrecisionFormat(context:WebGLRenderingContext):void {
		this.shaderPrecisionFormats.vlf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.LOW_FLOAT);
		this.shaderPrecisionFormats.vmf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.MEDIUM_FLOAT);
		this.shaderPrecisionFormats.vhf = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.HIGH_FLOAT);
		this.shaderPrecisionFormats.vli = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.LOW_INT);
		this.shaderPrecisionFormats.vmi = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.MEDIUM_INT);
		this.shaderPrecisionFormats.vhi = this.getDescibedShaderPrecisionFormat(context, context.VERTEX_SHADER, context.HIGH_INT);
		this.shaderPrecisionFormats.flf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.LOW_FLOAT);
		this.shaderPrecisionFormats.fmf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.MEDIUM_FLOAT);
		this.shaderPrecisionFormats.fhf = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.HIGH_FLOAT);
		this.shaderPrecisionFormats.fli = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.LOW_INT);
		this.shaderPrecisionFormats.fmi = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.MEDIUM_INT);
		this.shaderPrecisionFormats.fhi = this.getDescibedShaderPrecisionFormat(context, context.FRAGMENT_SHADER, context.HIGH_INT);
	}

	private getDescibedShaderPrecisionFormat(context:WebGLRenderingContext, shaderType:number, precisionType:number) {
		let shpf = context.getShaderPrecisionFormat(context.VERTEX_SHADER, context.LOW_FLOAT);
		return {rangeMin:shpf.rangeMin, rangeMax:shpf.rangeMax, precision:shpf.precision};
	}

	public userAgent:string = undefined;
	public detectError:boolean = undefined;
	public screenWidth:number = -1;
	public screenHeight:number = -1;
	public videoCard:string = 'unknown';
	public videoVendor:string = 'unknown';
	public officiallySupported:boolean = false;
	public supported:boolean = false;
	public version:string = 'unknown';
	public shadingVesion:string = 'unknown';
	
	public maxVertexAttributes:number = 0;
	public maxVertexUniformVectors:number = 0;
	public maxVertexTextureImageUnits:number = 0;
	public maxVaryingVectors:number = 0;

	public maxFragmentUniformVectors:number = 0;
	public maxTextureImageUnits:number = 0;
	public redBits:number = 0;
	public greenBits:number = 0;
	public blueBits:number = 0;
	public alphaBits:number = 0;
	public depthBits:number = 0;
	public stencilBits:number = 0;
	public maxRenderbufferSize:number = 0;
	public maxViewportDims0:number = 0;
	public maxViewportDims1:number = 0;
	public maxTextureSize:number = 0;
	public maxCubeMapTextureSize:number = 0;
	public maxCombinedTextureImageUnits:number = 0;

	public attributesAlpha:boolean = false;
	public attributesAntialias:boolean = false;
	public attributesDepth:boolean = false;
	public attributesPremultipliedAlpha:boolean = false;
	public attributesPreserveDrawingBuffer:boolean = false;
	public attributesStencil:boolean = false;
	public majorPerformanceCaveat:string = 'unknown';

	public supportedExtensions: Array<string> = [];
	public shaderPrecisionFormats:ShaderPrecisionFormats = new ShaderPrecisionFormats();

	public toString():string {
		return JSON.stringify(this, null, 4);
	}
}

class ShaderPrecisionFormats {
	public vlf:WebGLShaderPrecisionFormat;
	public vmf:WebGLShaderPrecisionFormat;
	public vhf:WebGLShaderPrecisionFormat;
	public vli:WebGLShaderPrecisionFormat;
	public vmi:WebGLShaderPrecisionFormat;
	public vhi:WebGLShaderPrecisionFormat;
	public flf:WebGLShaderPrecisionFormat;
	public fmf:WebGLShaderPrecisionFormat;
	public fhf:WebGLShaderPrecisionFormat;
	public fli:WebGLShaderPrecisionFormat;
	public fmi:WebGLShaderPrecisionFormat;
	public fhi:WebGLShaderPrecisionFormat;
}