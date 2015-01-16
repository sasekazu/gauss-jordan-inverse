// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="numeric-1.2.6.min.js" />



var elementSize=15;
var animateCount=0;
var speed=10;
var N=15;

$(document).ready(function () {

	$("#matSizeSlider").slider({
		min: 2, max: 20, step: 1, value: N,
		slide: function (event, ui) {
			N=ui.value;
			document.getElementById('matSizeSpan').innerHTML=N;
			startAnimation();
		},
	});
	document.getElementById('matSizeSpan').innerHTML=N;

	$("#start").click(function () {
		startAnimation();
	})

	startAnimation();

});


function startAnimation() {

	++animateCount;
	var animeteID=animateCount;
	var A=numeric.random([N, N]);
	var U=numeric.clone(A);
	var Ainv=identityMatrix(N);

	visualizeMatrix($("#Canvas-U"), U, N, N, -5, 5, elementSize);
	visualizeMatrix($("#Canvas-Ainv"), Ainv, N, N, -5, 5, elementSize);
	visualizeMatrix($("#Canvas-AAinv"), numeric.dot(A, Ainv), N, N, -5, 5, elementSize);

	var count=0;
	var i=0;
	var j=1;
	var k=0;
	var diagValue=U[i][i];
	for(var col=0; col<N; ++col) {
		U[i][col]/=diagValue;
		Ainv[i][col]/=diagValue;
	}
	var alpha=U[j][i]/U[i][i];
	function animate() {

		if(animeteID!=animateCount) {
			return;
		}

		// loop k の処理

		U[j][k]-=alpha*U[i][k];
		Ainv[j][k]-=alpha*Ainv[i][k];

		// visualization
		visualizeMatrix($("#Canvas-U"), U, N, N, -5, 5, elementSize);
		highlightMatrixRow($("#Canvas-U"), N, N, elementSize, i);
		highlightMatrixRow($("#Canvas-U"), N, N, elementSize, j);
		visualizeMatrix($("#Canvas-Ainv"), Ainv, N, N, -5, 5, elementSize);
		highlightMatrixRow($("#Canvas-Ainv"), N, N, elementSize, i);
		highlightMatrixRow($("#Canvas-Ainv"), N, N, elementSize, j);

		++count;

		++k;
		if(k>=N) {
			++j;
			// j = i は飛ばす
			if(j==i) {
				++j;
			}
			if(j>=N) {
				++i;
				if(i>=N) {
					// loop i の処理
					visualizeMatrix($("#Canvas-U"), U, N, N, -5, 5, elementSize);
					visualizeMatrix($("#Canvas-Ainv"), Ainv, N, N, -5, 5, elementSize);
					visualizeMatrix($("#Canvas-AAinv"), numeric.dot(A, Ainv), N, N, -5, 5, elementSize);
					return;
				}
				j=0;
			}
			// loop j の処理
			visualizeMatrix($("#Canvas-AAinv"), numeric.dot(A, Ainv), N, N, -5, 5, elementSize);
			diagValue=U[i][i];
			for(var col=0; col<N; ++col) {
				U[i][col]/=diagValue;
				Ainv[i][col]/=diagValue;
			}
			alpha=U[j][i]/U[i][i];

			k=0;
		}

		setTimeout(animate, speed);
	}
	animate();

}

function inverseUsingGaussJordanMeshod(A, N) {
	var U=numeric.clone(A);
	var Ainv=identityMatrix(N);
	var alpha;
	var diagValue;
	for(var i=0; i<N; ++i) {
		diagValue=U[i][i];
		for(var j=0; j<N; ++j) {
			U[i][j]/=diagValue;
			Ainv[i][j]/=diagValue;
		}
		for(var j=0; j<N; ++j) {
			if(i==j) {
				continue;
			}
			alpha=U[j][i]/U[i][i];
			for(var k=0; k<N; ++k) {
				U[j][k]-=alpha*U[i][k];
				Ainv[j][k]-=alpha*Ainv[i][k];
			}
		}
	}
	return Ainv;
}


function identityMatrix(size) {
	var tmp=new Array(size);
	for(var i=0; i<size; ++i) {
		tmp[i]=new Array(size);
		for(var j=0; j<size; ++j) {
			if(i==j) {
				tmp[i][j]=1;
			} else {
				tmp[i][j]=0;
			}
		}
	}
	return tmp;
}

function randomSymmetricMatrix(size) {
	var tmp=numeric.random([size, size]);
	var val;
	for(var i=1; i<size; ++i) {
		for(var j=0; j<i; ++j) {
			tmp[i][j]=tmp[j][i];
		}
	}
	return tmp;
}


function visualizeMatrix(canvas, mat, rows, cols, min, max, elementSize) {
	var context = canvas.get(0).getContext("2d");
	canvas.attr("width", rows*elementSize);
	canvas.attr("height", cols*elementSize);
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();

	context.setTransform(1,0,0,1,0,0);
	context.clearRect(0, 0, canvasWidth, canvasHeight);

	var imgData = context.getImageData(0,0,canvasWidth,canvasHeight);	
	var intensity;
	var r,g,b,a;
	var idx,x,y;
	for(var i = 0; i < rows; ++i) {
		for(var j = 0; j < cols; ++j) {
			if(mat[i][j] >= max) {
				intensity = 1;
			} else if(mat[i][j] <= min) {
				intensity = 0;
			} else {
				intensity = (mat[i][j] - min)/(max - min);
			}
			// グレースケール
			/*
			intensity = Math.floor(255*intensity);
			intensity=255-intensity;
			r=intensity;
			g=intensity;
			b=intensity;
			a=255;
			*/
			// カラー(赤・青)
			if(intensity<0.5) {
				r=0;
				g=0;
				b=255;
				a=-2*intensity+1;
			} else {
				r=255;
				g=0;
				b=0
				a=2*intensity-1;
			}
			r=Math.floor(255*r);
			g=Math.floor(255*g);
			b=Math.floor(255*b);
			a=Math.floor(255*a);

			for(var k=0; k<elementSize; ++k) {
				for(var l = 0; l < elementSize; ++l) {
					x = Math.floor(elementSize * j + k);
					y = Math.floor(elementSize * i + l);
					idx = imgData.width*y+x;
					imgData.data[4*idx] = r;
					imgData.data[4*idx+1] = g;
					imgData.data[4*idx+2] = b;
					imgData.data[4*idx+3] = a;
				}
			}
		}
	}
	context.putImageData(imgData, 0, 0);
}

function highlightMatrixElement(canvas, rows, cols, elementSize, row, col) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);

	context.fillStyle='#00ff00';
	context.globalAlpha=0.3;
	context.beginPath();
	context.rect(elementSize*col, elementSize*row, elementSize, elementSize);
	context.fill();
	context.globalAlpha=1.0;
}

function highlightMatrixRowCol(canvas, rows, cols, elementSize, row, col) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);

	context.fillStyle='#00ff00';
	context.globalAlpha=0.1;
	context.beginPath();
	context.rect(0, elementSize*row, canvasWidth, elementSize);
	context.rect(elementSize*col, 0, elementSize, canvasHeight);
	context.fill();
	context.globalAlpha=1.0;
}

function highlightMatrixRow(canvas, rows, cols, elementSize, row) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);

	context.fillStyle='#00ff00';
	context.globalAlpha=0.2;
	context.beginPath();
	context.rect(0, elementSize*row, canvasWidth, elementSize);
	context.fill();
	context.globalAlpha=1.0;
}

function highlightMatrixCol(canvas, rows, cols, elementSize, col) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);

	context.fillStyle='#00ff00';
	context.globalAlpha=0.2;
	context.beginPath();
	context.rect(elementSize*col, 0, elementSize, canvasHeight);
	context.fill();
	context.globalAlpha=1.0;
}

