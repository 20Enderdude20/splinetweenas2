var props = [
	'a', 'b',
	'c', 'd',
	'tx', 'ty'
];

var dom = fl.getDocumentDOM();
var timeline = dom.getTimeline();
var frameSelection = timeline.getSelectedFrames();
for (var j = 0; j < frameSelection.length; j += 3) {
	var layerIndex = frameSelection[j];
	var selStart = frameSelection[j + 1];
	var selEnd   = frameSelection[j + 2];
	var layer = timeline.layers[layerIndex];
	
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
		dom.selection = el0;
		var p0 = dom.getTransformationPoint();
		dom.selection = el1;
		var p1 = dom.getTransformationPoint();
		dom.selection = el2;
		var p2 = dom.getTransformationPoint();
		dom.selection = el3;
		var p3 = dom.getTransformationPoint();
		// Convert all in-between frames + keyframes
		timeline.getSelectedFrames([layerIndex, kfs[i] + 1, kfs[i + 1]]);
		timeline.convertToKeyframes();
		
		// Iterate through all in-between frames
		for (var fi = kfs[i] + 1; fi < kfs[i + 1]; fi++) {
			var t = (fi - kfs[i]) / (kfs[i + 1] - kfs[i]);
			//alert(t)
			var element = layer.frames[fi].elements;
			//alert(spline(t, p0.x, p1.x, p2.x, p3.x, fi0, fi1, fi2, fi3));
			//alert(p0.x);
			timeline.currentFrame = fi;
			dom.selectAll();
			dom.setTransformationPoint({
				x: spline(t, p0.x, p1.x, p2.x, p3.x, fi0, fi1, fi2, fi3),
				y: spline(t, p0.y, p1.y, p2.y, p3.y, fi0, fi1, fi2, fi3)
			});
			element[0].matrix = interpolateElement(element, t, el0, el1, el2, el3, fi0, fi1, fi2, fi3);
			dom.selectNone();
			layer.frames[fi].name = 'spline';
			layer.frames[fi].labelType = 'anchor';
		}
	}
}
function interpolateElement(targetEl, t, el0, el1, el2, el3, fi0, fi1, fi2, fi3) {
	for (var i = 0; i < props.length; i++) {
		interpolateProperty(targetEl, t, el0, el1, el2, el3, fi0, fi1, fi2, fi3, props[i]);
	}
}
function interpolateProperty(targetEl, t, el0, el1, el2, el3, fi0, fi1, fi2, fi3, name) {
	targetEl[0].matrix[name] = spline(t,
		el0[0].matrix[name], el1[0].matrix[name], el2[0].matrix[name], el3[0].matrix[name],
		fi0, fi1, fi2, fi3);
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

/*
var INFO_NAME = 'info_json';
var dom = fl.getDocumentDOM();

var dirPath = fl.browseForFolderURL("Image sequence directory?");
if (dirPath) {
	eval('var info = ' + FLfile.read(dirPath + '/' + INFO_NAME) || '{}');

	var dirName = dirPath.substr(dirPath.lastIndexOf('/') + i);
	dom.library.oddNewItem('graphic', dirName);
	dom.library.editItem();

	var libraryFolder = dirName + '-frames';
	dom.library.newFolder(libraryFolder);

	var timeline = dom.getTimeline();
	var names = FLfile.listFolder(dirPath, 'files');
	for(var i = 0; i < names.length; i++) {
		var name = names[i];
		if (name === INFO_NAME) continue;
		
		dom.importFile(dirPath + '/' + name, false); // Place on stage too
		dom.selectAll();
		if (dom.selection.length === 0) continue;
		dom.library.moveToFolder(libraryFolder, name, true);
		
		var origin =
			info[name] ||
			info[name.substr(0, name.lastIndexOf('.'))] ||
			[0, 0];
		var rect = dom.getSelectionRect();
		var scale = .25;
		dom.moveSelectionBy({
			x: -origin[0] * scale - rect.left,
			y: -origin[1] * scale - rect.top
		});
		dom.selectNone();
		
		timeline.insertBlankKeyframe();
	}
	timeline.removeFrames(timeline.currentFrame);
}
*/
