import React, { useCallback, useEffect, useRef, useState } from 'react';
import pdfLib from 'pdfjs-dist';
import serviceWorker from 'pdfjs-dist/build/pdf.worker.js';
import useEffectNoFirstRender from 'customHooks/useEffectNoFirstRender';
import './MPDFReader.scss'
import { toastr } from 'react-redux-toastr';

const MPDFFilesReader = ({ data }) => {
  const renderDivRef = useRef();
  const [pdfFile, setPdfFile] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const totalPages = useRef(1);

  useEffect(() => {
    pdfLib.GlobalWorkerOptions.workerSrc = serviceWorker;
    window.pdfjsWorker = serviceWorker;
    const loadingTask = pdfLib?.getDocument({ data });
    loadingTask.promise.then((pdf) => {
      totalPages.current = pdf.numPages;
      setPdfFile(pdf);
    }).catch((err) => toastr.error('Error', err?.message));

    return () => {
      pdfLib.GlobalWorkerOptions.workerSrc = null;
      window.pdfjsWorker = null;
    }
  }, [data, pdfLib]);

  const getPageCallback = useCallback(() => {
    pdfFile && pdfFile.getPage(pageNum).then((p) => {
      const scale = 1;
      const viewport = p.getViewport({ scale });

      // Prepare canvas using PDF page dimensions.
      const canvas = renderDivRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context.
      const renderContext = {
        canvasContext: context,
        viewport,
      };
      p.render(renderContext);
    }).catch((err) => toastr.error('Error', err?.message));
  }, [pdfFile, pageNum]);


  useEffectNoFirstRender(() => { getPageCallback(); }, [getPageCallback]);

  return (
    <div className="pdf-reader">
      <canvas className="pdf-reader-canvas" ref={renderDivRef}/>
      <div className="pdf-reader-pages-setting-options">
        <button
          disabled={pageNum === 1}
          onClick={() => {
            setPageNum(pageNum - 1);
          }}
        >
          <i className="fas fa-angle-double-left" />
        </button>
        <input 
          type="number"
          onKeyPress={(e) => {
            if(e.key === 'Enter') {
              const parsedValue = parseInt(e.target.value, 10);
              if(!isNaN(parsedValue)) {
                if(parsedValue < 0 || parsedValue > totalPages.current) {
                  toastr.error('Error', 'Entered an invalid page number');
                  return;
                }
                setPageNum(parsedValue);
                return;
              }
              toastr.error('Error', 'Entered an invalid page number');
            }
          }}
        />
        <p>{`${pageNum} / ${totalPages.current}`}</p>
        <button
          disabled={pageNum === totalPages.current}
          onClick={() => {
            setPageNum(pageNum + 1);
          }}>
          <i className="fas fa-angle-double-right" />
        </button>
      </div>
    </div>
  );
};

export default MPDFFilesReader;
