import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/homePage/LandingPage";
import MergePdfPage from "../pages/tools/MergePdfPage";
import CompressPdfPage from "../pages/tools/CompressPdfPage";
import SplitPdfPage from "../pages/tools/SplitPdfPage";
import RotatePdfPage from "../pages/tools/RotatePdfPage";
import ImagesToPdfPage from "../pages/tools/ImagesToPdfPage";
import PdfToWordPage from "../pages/tools/PdfToWordPage";
import AllToolsPage from "../pages/tools/AllToolsPage";
import WordToPdfPage from "../pages/tools/WordToPdfPage";
import ExcelToPdfPage from "../pages/tools/ExcelToPdfPage";
import PptToPdfPage from "../pages/tools/PptToPdfPage"

import TextToPdfPage from "../pages/tools/TextToPdfPage";
import HtmlToPdfPage from "../pages/tools/HtmlToPdfPage";
import PdfToExcelPage from "../pages/tools/PdfToExcelPage";
import PdfToPptPage from "../pages/tools/PdfToPptPage";

import PdfToImagePage from '../pages/tools/PdfToImagePage';
import PdfToTextPage from '../pages/tools/PdfToTextPage';

import DeletePagesPage from '../pages/tools/DeletePagesPage';
import AddPageNumbersPage from '../pages/tools/AddPageNumbersPage';
import ExtractPagesPage from '../pages/tools/ExtractPagesPage';

import ProtectPdfPage from '../pages/tools/ProtectPdfPage';
import UnlockPdfPage from '../pages/tools/UnlockPdfPage';

import FaqPage from "../pages/homePage/FaqPage";
import AboutUsPage from "../pages/homePage/AboutUsPage";
import SolutionsPage from "../pages/homePage/SolutionsPage";


function ToolBoxRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/all-tools" element={<AllToolsPage />} />
        <Route path="/merge-pdf" element={<MergePdfPage />} />
        <Route path="/compress-pdf" element={<CompressPdfPage />} />
        <Route path="/split-pdf" element={<SplitPdfPage />} />
        <Route path="/rotate-pdf" element={<RotatePdfPage />} />
        <Route path="/images-to-pdf" element={<ImagesToPdfPage />} />
        <Route path="/pdf-to-word" element={<PdfToWordPage />} />

        <Route path="/word-to-pdf" element={<WordToPdfPage />} />
        <Route path="/excel-to-pdf" element={<ExcelToPdfPage />} />
        <Route path="/ppt-to-pdf" element={<PptToPdfPage />} />

        <Route path="/text-to-pdf" element={<TextToPdfPage />} />
        <Route path="/html-to-pdf" element={<HtmlToPdfPage />} />

        <Route path="/pdf-to-excel" element={<PdfToExcelPage />} />
        <Route path="/pdf-to-ppt" element={<PdfToPptPage />} />

        <Route path="/pdf-to-image" element={<PdfToImagePage />} />
        <Route path="/pdf-to-text" element={<PdfToTextPage />} />

        <Route path="/delete-pages" element={<DeletePagesPage />} />
        <Route path="/add-page-numbers" element={<AddPageNumbersPage />} />
        <Route path="/extract-pages" element={<ExtractPagesPage />} />

        <Route path="/protect-pdf" element={<ProtectPdfPage />} />
        <Route path="/unlock-pdf" element={<UnlockPdfPage />} />

        <Route path="/help" element={<FaqPage />} /> 
        <Route path="/about-us" element={<AboutUsPage />} />

        <Route path="/solutions" element={<SolutionsPage />} />
      </Routes>
    </Router>
  );
}

export default ToolBoxRouter;
