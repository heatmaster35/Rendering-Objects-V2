// Starter code from: HelloTriangle.js (c),PickObject.js (c), and RotateObject.js 2012 matsuda
//*************************************
//* Name: Leo Gomez                   *
//* Login: legomez                    *
//* SID: 1360609                      *
//* Lab#: 3                           *
//* file: Picking.js                  *
//* class: CMPS - 160L                *
//* description:                      *
//* rotates,scales, and changes       *
//* colors of the object by left      *
//* ,right, or middle clicking        *
//* mouse and uses prog2 as the scene *
//*************************************
// Vertex shader program
var VSHADER_SOURCE =
  [
  'precision mediump float;',
  'uniform mat4 mWorld;',
  'uniform mat4 mView;',
  'uniform mat4 mProj;',
  '',
  'attribute vec3 vNormal;',
  'varying vec3 fNormal;',
  'attribute vec4 a_Position;',
  'uniform vec4 color;',
  'void main() {',
  '  fNormal = (mWorld * vec4(vNormal,0.0)).xyz;',
  '  gl_Position = mProj * mView * mWorld * a_Position;',
  '}'
  ].join('\n');

// Fragment shader program
var FSHADER_SOURCE =
  [
  'precision mediump float;',
  'uniform vec4 color;',
  'varying vec3 fNormal;',
  'void main() {',
  '  vec3 Ia = vec3(0.2,0.2,0.2);',
  '  vec3 Light = vec3(1.0,1.0,1.0);',
  '  vec3 L = normalize(vec3(0,0,-1));',
  '',
  '  vec3 LightI = Ia + Light* max(dot(fNormal,L),0.0);',
  '',
  '  gl_FragColor = vec4(color.rgb * LightI, 1.0);',
  '}'
  ].join('\n');
  
// Retrieve <canvas> element
var canvas = document.getElementById('webgl');

// Get the rendering context for WebGL
// used a different type of context
// in order to keep the background
// after including more triangles

var gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true});

  
var polyAmount;
var coorAmount;
var polyDetails = new Array();
var coorDetails = new Array();
var coorChecker = false;
var polyChecker = false;
var Ymax = 0;
var Ymin = 0;
var Xmax = 0;
var Xmin = 0;
var Zmax = 0;
var Zmin = 0;
var maxObjVal = 0;
var color = [1.0,0.5,0.5];
var bcolor = [0,0,0];
var orthoCharge = true;

//value that renders from mouse
var currentAngle = [0.0,0.0];
var scaleFactor = 1;

//checks if object is clicked
var isObject = false;

//these switch between the background and object colors
var switcher = true;
var switcher2 = true;

function main() 
{
	//separated the code into backgrounds changes
	//and drawing values
	drawBackground();
	
	//grabs the information from the file
	document.getElementById("infile1").addEventListener("change", readFileCoor, false);
	document.getElementById("infile2").addEventListener("change", readFilePoly, false);
	//document.getElementById("update").addEventListener("change", setUpdate, false);
	if(polyChecker && coorChecker)
		nextMain();
}

//gets all the new triangle details
//to add to the canvas
function readFileCoor(event)
{
	var file = event.target.files[0];
	var type = '';
	if(file)
	{
		var tmp = file.name.split('.');
		type = tmp.pop();
		coorChecker = true;
	}//if(file)
	if(!file)
	{
		alert("Failed to load file");
	}//if(not file)
		
	//checks to see if its a coor file
	else if(!type.match("coor"))
	{
		alert(file.name + " is not a valid coor file")
	} //else if (not coor)
	else
	{
		var r = new FileReader();
		r.onload = function(e)
		{
			//gets the file
			var allXvalues = new Array();
			var allYvalues = new Array();
			var allZvalues = new Array();
			
			var dummy1 = e.target.result;
			//gets first line from file
			coorAmount = dummy1.substr(0,dummy1.indexOf("\n"));
			var lines = dummy1.split("\n");
			lines.splice(0,1);
			dummy1 = lines.join("\n");
			//gets rid of blank space
			var dummy2 = dummy1.replace(/ /g,",");
			var contents = dummy2.replace(/\n/g,",");
			//splits and reverses the values
			//to pop later
			var temp1 = contents.split(",");
			var temp2 = new Array();
			for(var i = 0;i < temp1.length; i++)
			{
				if(temp1[i])
					temp2.push(temp1[i]);
			}
			var temp3 = new Array();
			for(var i = 0;i<temp2.length;i++)
			{
				if(i%4 != 0)
					temp3.push(temp2[i]);
			}//for loop
			
			//max and mins values
			for(var i = 0;i<temp3.length;i++)
			{
				if(i%3 == 0)
					allXvalues.push(temp3[i]);
			}//for loop
			Xmax = Math.max(...allXvalues);
			Xmin = Math.min(...allXvalues);
			for(var i = 0;i<temp3.length;i++)
			{
				if((i+2)%3 == 0)
					allYvalues.push(temp3[i]);
			}//for loop
			Ymax = Math.max(...allYvalues);
			Ymin = Math.min(...allYvalues);
			for(var i = 0;i<temp3.length;i++)
			{
				if((i+1)%3 == 0)
					allZvalues.push(temp3[i]);
			}//for loop
			Zmax = Math.max(...allZvalues);
			Zmin = Math.min(...allZvalues);
			
			//gives all the coor stuff
			//coorDetails = temp3;
			for(var i = 0;i<temp3.length;i++)
			{
				coorDetails.push(parseFloat(temp3[i]));
			}
			//console.log("coorDetails = ",coorDetails);
			coorDetails.splice(0,0,0,0,0);
			main();
		}//onload
		r.readAsText(file);
	}//else
}//readFileCoor()

function readFilePoly(event)
{
	var file = event.target.files[0];
	var type = '';
	if(file)
	{
		var tmp = file.name.split('.');
		type = tmp.pop();
		polyChecker = true;
	}//if(file)
		
	if(!file)
	{
		alert("Failed to load file");
	}//if(not file)
	else if(!type.match("poly"))
	{
		alert(file.name + " is not a valid .poly file")
	} //else if (not coor)
	else
	{
		var r = new FileReader();
		r.onload = function(e)
		{
			//gets the file
			var dummy1 = e.target.result;
			//gets first line from file
			polyAmount = dummy1.substr(0,dummy1.indexOf("\n"));
			var lines = dummy1.split("\n");
			lines.splice(0,1);
			for(var i = 0;i<lines.length;i++)
			{
				if(!(lines[i]))
				{
					lines.splice(i,1);
					i--;
				}
			}
			dummy1 = lines.join("\n");
			//split the lines
			var stuff = dummy1.split("\n");
			//split the values make a 2d Array
			for(var j = 0; j < stuff.length; j++)
			{
				stuff[j] = stuff[j].split(" ");
			}
			//clear empty spaces
			for(var j = 0; j < stuff.length; j++)
			{
				for(var i = 0; i<stuff[j].length; i++)
				{
					if(!(stuff[j][i]))
					{
						stuff[j].splice(i,1);
						i--;
					}
				}
			}
			var atemp = new Array();
			//splits into possibly more triangles
			for(var j = 0; j < stuff.length;j++)
			{	
				if(stuff[j].length > 4)
				{
					for(var i = 3;i <stuff[j].length;i++)
					{
						atemp.push(stuff[j][1]);
						atemp.push(stuff[j][i-1]);
						atemp.push(stuff[j][i]);
						if(i > 3)
						{
							polyAmount++;
						}
					}
				}else
				{
					for(var a = 1;a<stuff[j].length;a++)
					{
						atemp.push(stuff[j][a]);
					}
				}
			}
			for(var i = 0;i<atemp.length;i++)
			{
				polyDetails.push(parseFloat(atemp[i]));
			}
			//polyDetails.splice(0,0,0,0,0);
			//console.log("polyDetails = ",polyDetails);
			main();
		}//onload
		r.readAsText(file);	
	}//else(read file)
}//readFilePoly()

function drawBackground()
{
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }//if(no gl)

  // Specify the color for clearing <canvas>
  // changed to turn dark gray
  gl.clearColor(bcolor[0],bcolor[1],bcolor[2],1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
}//drawBackground()

function setView(evt)
{
	//console.log("setview works");
	//sets up the ortho or perspective view
	//and changes the button color
	if(orthoCharge)
	{
		orthoCharge = false;
		var x = document.getElementById("button");
		x.style.background='#DD0000';
	}
	else
	{
		orthoCharge = true;
		var x = document.getElementById("button");
		x.style.background='#00DD00';
	}
}


function nextMain()
{
	//creates the event handlers and passes
	//the angle and scalefactor
	initEventHandlers(currentAngle,scaleFactor);

	//animates the changes in color,scale,
	//and rotation
	var loop = function()
	{
		renderObject(currentAngle,scaleFactor);
		requestAnimationFrame(loop,canvas);
	};
	loop();
}

//draws the object
function renderObject()
{
	if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
	}//if(no gl)

	// Write the positions of vertices to a vertex shader
	// Takes into consideration position vertices and color
	
	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);  
	
	gl.shaderSource(vertShader, VSHADER_SOURCE);
	gl.shaderSource(fragShader, FSHADER_SOURCE);
	
	//check for shader errors
	gl.compileShader(vertShader);
	if(!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertShader));
		return;
	}
	gl.compileShader(fragShader);
	if(!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragShader));
		return;
	}
	
	//create program and link shaders
	var program = gl.createProgram();
	gl.attachShader(program, vertShader);
	gl.attachShader(program, fragShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	
	//catch addtional program errors
	gl.validateProgram(program);
	if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	
	gl.useProgram(program);
	
	//creating all needed maticies for the picture
	var matrixWorldUL = gl.getUniformLocation(program, 'mWorld');
	var matrixViewUL = gl.getUniformLocation(program, 'mView');
	var matrixProjUL = gl.getUniformLocation(program, 'mProj');
	
	//console.log("Ymax = ",Ymax);
	//console.log("Xmax = ",Xmax);
	//console.log("Zmax = ",Zmax);
	//console.log("Ymin = ",Ymin);
	//console.log("Xmin = ",Xmin);
	//console.log("Zmin = ",Zmin);
	var worldMatrix = new Matrix4();
	var viewMatrix = new Matrix4();
	var projMatrix = new Matrix4();
	
	//setting up the values for the matrices
	worldMatrix.setIdentity();
	viewMatrix.setIdentity();
	projMatrix.setIdentity();
	maxObjVal = Math.max(Math.abs(Zmax - Zmin),Math.abs(Ymax-Ymin),Math.abs(Xmax-Xmin));
	worldMatrix.translate((-1*(Xmax+Xmin)/2),(-1*(Ymax+Ymin)/2),(-1*(Zmax+Zmin)/2));
	worldMatrix.scale(1/maxObjVal,1/maxObjVal,1/maxObjVal);
	
	//sets up rotation
	worldMatrix.setRotate(0,0,1,0);
	
	//switch statement for ortho or perspective
	if(orthoCharge)
	{
		viewMatrix.ortho(-maxObjVal,maxObjVal,-maxObjVal,maxObjVal,-maxObjVal,maxObjVal);
	}
	else
	{
		viewMatrix.lookAt(0,0,3*maxObjVal,0,0,0,0,1,0);
		projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);
	}
	
	//pass the matrices through webgl
	gl.uniformMatrix4fv(matrixWorldUL,gl.FALSE, worldMatrix.elements);
	gl.uniformMatrix4fv(matrixViewUL,gl.FALSE, viewMatrix.elements);
	gl.uniformMatrix4fv(matrixProjUL,gl.FALSE, projMatrix.elements);
	
	// Draw the rendered object
	//this is where i put all of the coor details
	var vertices = coorDetails;
	//console.log("vertices = "+vertices);
  
	//this is where i put a line of the poly details
	var polygons = polyDetails;
	//console.log("polygons = "+polygons);

	//write the data for the color
	bcolor = [0,0,0];
	
	//check for change in background color
	if(!switcher2)
		bcolor = [255,255,255];
	//check for change in object color
	if(isObject&&!switcher)
	{
		color = [1,1,1];
	}else
	if(switcher)
	{
		var r = document.getElementById("R").value;
		var g = document.getElementById("G").value;
		var b = document.getElementById("B").value;
		color = [r/50,g/50,b/50];
	}
	
	//passes the value "color" to webgl
	program.color = gl.getUniformLocation(program, 'color');
	gl.uniform4fv(program.color, [color[0],color[1],color[2],1]);
	//do light shading here-----------------------------------------------------------------------------------***
	//get the normals of the polygons for flat shading
	var polyNormals = new Array();
	var V1 = new Array();
	V1 = [];
	var V2 = new Array();
	V2 = [];
	var V3 = new Array();
	V3 = [];
	var a = new Array();
	a = [];
	var b = new Array();
	b = [];
	var result = new Array();
	result = [];
	polyNormals = [];
	
	//loops through the polygons and obtains the poly normals
	for(var i = 0; i < polygons.length;i+=3)
	{
		V1 = [coorDetails[(polygons[i]*3)],coorDetails[(polygons[i]*3)+1],coorDetails[(polygons[i]*3)+2]];
		V2 = [coorDetails[(polygons[i+1]*3)],coorDetails[(polygons[i+1]*3)+1],coorDetails[(polygons[i+1]*3)+2]];
		V3 = [coorDetails[(polygons[i+2]*3)],coorDetails[(polygons[i+2]*3)+1],coorDetails[(polygons[i+2]*3)+2]];
		
		//V1V2 = [V2[0] - V1[0],V2[1] - V1[1],V2[2] - V1[2]];
		//V1V3 = [V3[0] - V1[0],V3[1] - V1[1],V3[2] - V1[2]];
		a = [V2[0] - V1[0],V2[1] - V1[1],V2[2] - V1[2]];
		b = [V3[0] - V1[0],V3[1] - V1[1],V3[2] - V1[2]];
		
		//result = [V1V2[1]*V1V3[2] - (V1V3[1]*V1V2[2]),-(V1V2[0]*V1V3[2] - (V1V3[0]*V1V2[2])),V1V2[0]*V1V3[1] - (V1V3[0]*V1V2[1])];
		result = [a[1] * b[2] - a[2] * b[1],
		          a[2] * b[0] - a[0] * b[2],
				  a[0] * b[1] - a[1] * b[1]
		]
		
		polyNormals.push(result[0]);
		polyNormals.push(result[1]);
		polyNormals.push(result[2]);
	}
	
	
	//normalizes the poly normals
	var N1 = 0;
	var N2 = 0;
	var N3 = 0;
	var mag = 0;
	
	for(var i = 0; i < polyNormals.length; i+=3)
	{
		//console.log("this ran many times");
		N1 = polyNormals[i];
		N2 = polyNormals[i+1];
		N3 = polyNormals[i+2];
		
		mag = Math.sqrt(N1*N1+N2*N2+N3*N3);
		
		polyNormals[i] = N1/mag;
		polyNormals[i+1] = N2/mag;
		polyNormals[i+2] = N3/mag;
	}
	
	
	//console.log("polyAmount = ", polyAmount);
	//console.log("polygons.length = ", polygons.length/3);
	//console.log("normals.length = ",polyNormals.length/3);
	//console.log("coorAmount = ",coorAmount);
	//console.log("vertices.length/3 = ", vertices.length/3);
	//console.log("polygons.length %3 = ", polygons.length%3);
	
	//
	//make the normals for smooth shading!
	//
	
	
	
	// Create a buffer objects for coor,poly, and normals
	//buffer for coor
	var coorVertexBufferObject = gl.createBuffer();
	
	//buffer for poly
	var polyIndexBufferObject = gl.createBuffer();
	
	//buffer for normal
	var normalsBufferObject = gl.createBuffer();
	
	var a_Position = gl.getAttribLocation(program, 'a_Position');
	
	var normalsAttribLocation = gl.getAttribLocation(program,'vNormal');
	
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}//if()
			
	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, coorVertexBufferObject);
	// Write date into the buffer objectz
	//console.log("vertices = ",vertices);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),gl.STATIC_DRAW);
	
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
	//gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 3*Float32Array.BYTES_PER_ELEMENT, 0);
	
	
	// Bind the buffer object to target
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polyIndexBufferObject);
	// Write date into the buffer objectz
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(polygons), gl.STATIC_DRAW);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);
	//console.log("polyVal = ",polygons);
	
	//Assign the buffer object to bind the normals
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBufferObject);
	//write the data into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(polyNormals),gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, normalsBufferObject);

	gl.vertexAttribPointer(normalsAttribLocation, 3, gl.FLOAT, true,0,0);
	
	gl.enableVertexAttribArray(normalsAttribLocation);
	
	//console.log("Done drawing objects");
	//console.log("coorAmount",coorAmount);
	//draws and rotates object
	worldMatrix.scale(scaleFactor,scaleFactor,scaleFactor);
	worldMatrix.rotate(currentAngle[0],1,0,0);
	worldMatrix.rotate(currentAngle[1],0,1,0);
	gl.uniformMatrix4fv(matrixWorldUL, gl.FALSE,worldMatrix.elements);
	
	//draws the object
	drawBackground();
	gl.drawElements(gl.TRIANGLES, 3*polyAmount, gl.UNSIGNED_SHORT, 0);
	
}//renderObject()


//sets up the event handlers
function initEventHandlers() {
	var dragging = false;         // Dragging or not
	var leftC = false;
	var rightC = false;
	var middleC = false;
	var lastX = -1, lastY = -1;   // Last position of the mouse
	
	
	//gets rid of the right click menu on the canvas
	canvas.addEventListener("contextmenu", function(event)
	{
		event.preventDefault();
		return false;
	});

	canvas.onmousedown = function(ev) {   // Mouse is pressed
	var x = ev.clientX, y = ev.clientY;
	// Start dragging if a moue is in <canvas>
	var rect = ev.target.getBoundingClientRect();
	//dragging is true when its within the canvas
	if ((rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom)&&check(x,y)) 
	{
		lastX = x; lastY = y;
		dragging = true;
	}
	
	//cases for the left mouse click
	if(ev.button === 0)
	{
		isObject = check(x,y);
		//console.log("isObject = ",isObject);
		if(isObject)
			switcher = !switcher;
		if(!isObject)
			switcher2 = !switcher2
	}else
	//cases for the right mouse click
	if(ev.button === 2)
	{
		rightC = true;
	}else 
	//cases for the middle mouse click
	if(ev.button === 1)
	{
		middleC = true;
	}
  };

  //rest values when mouse is up
  canvas.onmouseup = function(ev) { dragging = false;leftC = false;
					rightC = false;middleC = false;}; // Mouse is released

  //when mouse drags, change the values based on the mouse					
  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
	var factor = 100/canvas.height; // The rotation ratio
	var dx = factor * (x - lastX);
	var dy = factor * (y - lastY);
    if (dragging) {
		if(rightC)
		{
			// Limit x-axis rotation angle to -90 to 90 degrees
			currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
			currentAngle[1] = currentAngle[1] + dx;
		}else 
		if(middleC)
		{
			scaleFactor = Math.max(Math.min(scaleFactor + -dy*0.05, 2.0), 0.3);
		}
    }
    lastX = x, lastY = y;
  };
}

//checks to see if the mouse clicked on the object
function check(x, y) {
	var picked = false;
	//gl.uniform1i(u_Clicked, 1);  // Pass true to u_Clicked
	// Read pixel at the clicked position
	var pixels = new Uint8Array(4); // Array for storing the pixel value
	y = canvas.height - y;
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	//console.log("pixels = ",pixels);
	if (!(pixels[0] == 0&&pixels[1] == 0&&pixels[2] == 0)&&
		!(pixels[0] == 255&&pixels[1] == 255&&pixels[2] == 255)) // The mouse in on cube if R(pixels[0]) is 255
		picked = true;
	//gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
	return picked;
}

