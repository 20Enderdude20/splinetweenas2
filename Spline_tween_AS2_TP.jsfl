var rx = [];
var ry = [];
var tpx = [];
var tpy = [];
var tpdel = [];
var thetax = [];
var thetay = [];
var mat = [];
var matxy = [];
var regp = [];
var transformation = [];
var dom = fl.getDocumentDOM();
var timeline = dom.getTimeline();
var frameSelection = timeline.getSelectedFrames();
for (var j = 0; j < frameSelection.length; j += 3) {
	var layerIndex = frameSelection[j];
	var selStart = frameSelection[j + 1];
	var selEnd   = frameSelection[j + 2];
	var layer = timeline.layers[layerIndex];
	timeline.setSelectedLayers(layerIndex);
	var kfs = [];
	var prevStartFrame = -1;
	for (var fi = selStart; fi < selEnd; fi++) {
		var startFrame = layer.frames[fi].startFrame;
		if (startFrame === prevStartFrame) continue;
		if (layer.frames[fi].elements.length === 0) continue;
		kfs.push(startFrame);
		prevStartFrame = startFrame;
	}
	/*
	for (var fi = selStart; fi < selEnd; fi++) {
		var startFrame = layer.frames[fi].startFrame;
		if (startFrame === prevStartFrame) continue;
		kfs.push(startFrame);
		prevStartFrame = startFrame;
	}
	*/
//	alert('keyframes: ' + kfs);
	
	for (var i = 0; i < kfs.length - 1; i++) {
		
		var fi0 = kfs[Math.max(0, i - 1)];
		var fi1 = kfs[i + 0];
		var fi2 = kfs[i + 1];
		var fi3 = kfs[Math.min(i + 2, kfs.length - 1)];
		var el0 = layer.frames[fi0].elements;
		var el1 = layer.frames[fi1].elements;
		var el2 = layer.frames[fi2].elements;
		var el3 = layer.frames[fi3].elements;
		timeline.currentFrame = fi0;
		dom.selection = el0;
		var p0 = dom.getTransformationPoint();
		timeline.currentFrame = fi1;
		dom.selection = el1;
		var p1 = dom.getTransformationPoint();
		timeline.currentFrame = fi2;
		dom.selection = el2;
		var p2 = dom.getTransformationPoint();
		timeline.currentFrame = fi3;
		dom.selection = el3;
		var p3 = dom.getTransformationPoint();
		/* Get the absolute coordinates of the transformation points 
		(equivalent to element.transformationX & element.transformationY). */
			 tpx[0] = abstransformation(el0, p0, 'x');
			 tpy[0] = abstransformation(el0, p0, 'y');
			 
			 tpx[1] = abstransformation(el1, p1, 'x');
			 tpy[1] = abstransformation(el1, p1, 'y');
			 
			 tpx[2] = abstransformation(el2, p2, 'x');
			 tpy[2] = abstransformation(el2, p2, 'y');
			 
			 tpx[3] = abstransformation(el3, p3, 'x');
			 tpy[2] = abstransformation(el3, p3, 'y');
		/* Get transformation matrix's point coordinates in polar form
		 (so rotation can be interpreted properly). */
			 rx[0] = radius(el0, 'a', 'b');
			 ry[0] = radius(el0, 'c', 'd');
			 
			 rx[1] = radius(el1, 'a', 'b');
			 ry[1] = radius(el1, 'c', 'd');
			 
			 rx[2] = radius(el2, 'a', 'b');
			 ry[2] = radius(el2, 'c', 'd');
			 
			 rx[3] = radius(el3, 'a', 'b');
			 ry[3] = radius(el3, 'c', 'd');
			 
			 thetax[0] = angleacos(el0, rx[0], 'a', 'b');
			 thetay[0] = angleasin(el0, ry[0], 'c', 'd');
			 
			 thetax[1] = angleacos(el1, rx[1], 'a', 'b');
			 thetay[1] = angleasin(el1, ry[1], 'c', 'd');
			 
			 thetax[2] = angleacos(el2, rx[2], 'a', 'b');
			 thetay[2] = angleasin(el2, ry[2], 'c', 'd');
			 
			 thetax[3] = angleacos(el3, rx[3], 'a', 'b');
			 thetay[3] = angleasin(el3, ry[3], 'c', 'd');
		// Convert all in-between frames + keyframes
		timeline.getSelectedFrames([layerIndex, kfs[i] + 1, kfs[i + 1]]);
		timeline.convertToKeyframes();
		
		// Iterate through all in-between frames
		for (var fi = kfs[i] + 1; fi < kfs[i + 1]; fi++) {
			 var t = (fi - kfs[i]) / (kfs[i + 1] - kfs[i]);
			 var element = layer.frames[fi].elements;
			 timeline.currentFrame = fi;
			 dom.selection = element;
			 dom.setTransformationPoint({x:spline(t, p0.x, p1.x, p2.x, p3.x, fi0, fi1, fi2, fi3),
									     y:spline(t, p0.y, p1.y, p2.y, p3.y, fi0, fi1, fi2, fi3)});
			 tpdel.x = abstransformation(element, dom.getTransformationPoint(), 'x');
			 tpdel.y = abstransformation(element, dom.getTransformationPoint(), 'y');
			 mat.rx = spline(t, rx[0], rx[1], rx[2], rx[3], fi0, fi1, fi2, fi3);
			 mat.ry = spline(t, ry[0], ry[1], ry[2], ry[3], fi0, fi1, fi2, fi3);
			 mat.thetax = spline(t, thetax[0], thetax[1], thetax[2], thetax[3], fi0, fi1, fi2, fi3);
			 mat.thetay = spline(t, thetay[0], thetay[1], thetay[2], thetay[3], fi0, fi1, fi2, fi3);
			 transformation.x = spline(t, tpx[0], tpx[1], tpx[2], tpx[3], fi0, fi1, fi2, fi3);
			 transformation.y = spline(t, tpy[0], tpy[1], tpy[2], tpy[3], fi0, fi1, fi2, fi3);
			 matxy.a = mat.rx*Math.cos(mat.thetax);
			 matxy.b = mat.rx*Math.sin(mat.thetax);
			 matxy.c = mat.ry*Math.cos(mat.thetay);
			 matxy.d = mat.ry*Math.sin(mat.thetay);
			 tpdel.x = transformation.x - tpdel.x;
			 tpdel.y = transformation.y - tpdel.y;
			 dom.resetTransformation();
			 dom.transformSelection(matxy.a, matxy.b, matxy.c, matxy.d);
			 dom.moveSelectionBy({x:tpdel.x, y:tpdel.y});
			 tpdel.x = abstransformation(element, dom.getTransformationPoint(), 'x');
			 tpdel.y = abstransformation(element, dom.getTransformationPoint(), 'y');
			 tpdel.x = transformation.x - tpdel.x;
			 tpdel.y = transformation.y - tpdel.y;
			 dom.moveSelectionBy({x:tpdel.x, y:tpdel.y});
			 // I repeated the translation part since dom.resetTransformation 
			 // doesn't keep the transformation point still for some reason.
			 layer.frames[fi].name = 'spline';
			 layer.frames[fi].labelType = 'anchor';
		}
	}
}


function radius(ele, length, width) {
	return Math.sqrt(Math.pow(ele[0].matrix[length], 2) + Math.pow(ele[0].matrix[width], 2));
}

function abstransformation(ele, point, dim) {
	if (dim === 'x') {
	return ele[0].matrix.tx + ele[0].matrix.a*point.x + ele[0].matrix.c*point.y;
	}
	else {
	return ele[0].matrix.ty + ele[0].matrix.d*point.y + ele[0].matrix.b*point.x;
	}
}
				
function angleacos(ele, rad, vecta, vectb) {
	return (2*(ele[0].matrix[vectb] >= 0) - 1)*Math.acos(ele[0].matrix[vecta] / rad);
}

function angleasin(ele, rad, vectc, vectd) {
	return (2*(ele[0].matrix[vectc] > 0) - 1)*Math.asin(ele[0].matrix[vectd] / rad) 
	+ Math.PI*(ele[0].matrix[vectc] <= 0);
}
	
//Catmull-Rom
function spline(t, p0, p1, p2, p3, p0f, p1f, p2f, p3f) {
	if (p2f && p3f) {
		// calculate interval lengths
		var t12 = p2f - p1f;
		var t01 = (p1f - p0f) || t12;
		var t23 = (p3f - p2f) || t12;
		
		// multiply values accordingly,
		// so if the preceding interval is really short,
		// its value gets intensified to reflect that fast speed
		var mult01 = t12 / t01;
		var mult23 = t12 / t23;
		p0 = (p0 - p1) * mult01 + p1;
		p3 = (p3 - p2) * mult23 + p3;
	}
	return .5 * (
		2*p1 + 
		(p2 - p0) * t + 
		(2*p0 - 5*p1 + 4*p2 - p3) * t * t + 
		(3*p1 - p0 - 3*p2 + p3) * t * t * t
	);
}


