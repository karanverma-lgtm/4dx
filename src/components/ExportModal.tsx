'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPerformance } from '../data/mockData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: UserPerformance;
}

export default function ExportModal({ isOpen, onClose, activeUser }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const activeUserRef = useRef(activeUser);

  // Keep a ref of the activeUser so the timer hook has access to the latest values
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    if (!isOpen) {
      setExporting(false);
      setProgress(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  const triggerDownload = (format: 'csv' | 'pdf' | 'xlsx') => {
    const user = activeUserRef.current;
    const timestamp = new Date().toLocaleString();
    let blob: Blob;
    let filename: string;

    if (format === 'csv') {
      filename = `sales-performance-report-${user.id}.csv`;
      const csvData = [
        ['Sales Performance Report'],
        ['Name', user.name],
        ['Team', user.team],
        ['Commitment Average', `${user.commitmentAverage}%`],
        [],
        ['Metric', 'Current Value', 'Target Value', 'Progress'],
        ['Revenue', `${user.metrics.revenue.current}`, `${user.metrics.revenue.target}`, `${user.metrics.revenue.progress}%`],
        ['Pipeline', `${user.metrics.pipeline.current}`, `${user.metrics.pipeline.target}`, `${user.metrics.pipeline.progress}%`],
        ['Seat Confirmed', `${user.metrics.seats.current}`, `${user.metrics.seats.target}`, `${user.metrics.seats.progress}%`],
        [],
        ['Generated on', timestamp],
      ].map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\r\n');

      blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });

    } else if (format === 'xlsx') {
      // Generate an HTML table that Excel can open natively as .xls
      filename = `sales-performance-report-${user.id}.xls`;
      const htmlTable = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>td{font-family:Arial;font-size:12px;padding:4px 8px;border:1px solid #ccc}th{font-family:Arial;font-size:12px;font-weight:bold;padding:4px 8px;border:1px solid #999;background:#e5eeff}</style></head>
<body>
<h2 style="font-family:Arial">Sales Performance Report — ${user.name}</h2>
<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Name</td><td>${user.name}</td></tr>
<tr><td>Team</td><td>${user.team}</td></tr>
<tr><td>Commitment Average</td><td>${user.commitmentAverage}%</td></tr>
</table>
<br/>
<table>
<tr><th>Metric</th><th>Current Value (₹)</th><th>Target Value (₹)</th><th>Progress</th></tr>
<tr><td>Revenue</td><td>${user.metrics.revenue.current.toLocaleString('en-IN')}</td><td>${user.metrics.revenue.target.toLocaleString('en-IN')}</td><td>${user.metrics.revenue.progress}%</td></tr>
<tr><td>Pipeline</td><td>${user.metrics.pipeline.current.toLocaleString('en-IN')}</td><td>${user.metrics.pipeline.target.toLocaleString('en-IN')}</td><td>${user.metrics.pipeline.progress}%</td></tr>
<tr><td>Seat Confirmed</td><td>${user.metrics.seats.current}</td><td>${user.metrics.seats.target}</td><td>${user.metrics.seats.progress}%</td></tr>
</table>
<p style="font-family:Arial;font-size:10px;color:#888">Generated on: ${timestamp}</p>
</body></html>`;
      blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });

    } else {
      // Generate a real styled PDF using raw PDF 1.4 vector/text commands
      filename = `sales-performance-report-${user.id}.pdf`;

      const escapePdfText = (text: string) => {
        return text
          .replace(/\\/g, '\\\\')
          .replace(/\(/g, '\\(')
          .replace(/\)/g, '\\)');
      };

      const streamLines: string[] = [];

      // 1. Draw top banner background (Slate Blue - #091426)
      streamLines.push('0.035 0.078 0.149 rg'); // Deep slate blue fill color
      streamLines.push('40 680 532 70 re f'); // Draw filled rectangle

      // Banner Text: Title
      streamLines.push('BT');
      streamLines.push('/F2 18 Tf'); // Helvetica-Bold 18pt
      streamLines.push('1 1 1 rg'); // White text
      streamLines.push('55 720 Td');
      streamLines.push(`(${escapePdfText("SALES PERFORMANCE REPORT")}) Tj`);
      streamLines.push('ET');

      // Banner Text: Subtitle
      streamLines.push('BT');
      streamLines.push('/F1 10 Tf'); // Helvetica 10pt
      streamLines.push('0.7 0.8 0.95 rg'); // Muted blue-gray text
      streamLines.push('55 698 Td');
      streamLines.push(`(${escapePdfText("4DX — THE FOUR DISCIPLINES OF EXECUTION")}) Tj`);
      streamLines.push('ET');

      // 2. Draw Profile info box (light blue container with outline border)
      streamLines.push('0.77 0.78 0.80 RG'); // Muted border
      streamLines.push('0.937 0.957 1.0 rg'); // Very light container background
      streamLines.push('40 595 532 70 re B'); // Fill and stroke

      // Profile Header Title
      streamLines.push('BT');
      streamLines.push('/F2 11 Tf');
      streamLines.push('0.035 0.078 0.149 rg');
      streamLines.push('55 638 Td');
      streamLines.push(`(Employee Profile:) Tj`);
      streamLines.push('ET');

      // Profile Info Left: Name & Team
      streamLines.push('BT');
      streamLines.push('/F1 11 Tf');
      streamLines.push('0.2 0.2 0.2 rg');
      streamLines.push('55 615 Td');
      streamLines.push(`(Name:  ${escapePdfText(user.name)}) Tj`);
      streamLines.push('ET');

      streamLines.push('BT');
      streamLines.push('/F1 11 Tf');
      streamLines.push('0.2 0.2 0.2 rg');
      streamLines.push('220 615 Td');
      streamLines.push(`(Team:  ${escapePdfText(user.team)}) Tj`);
      streamLines.push('ET');

      // Profile Info Right: Commitment Average
      streamLines.push('BT');
      streamLines.push('/F2 9 Tf');
      streamLines.push('0.4 0.4 0.45 rg');
      streamLines.push('410 638 Td');
      streamLines.push(`(COMMITMENT AVERAGE) Tj`);
      streamLines.push('ET');

      streamLines.push('BT');
      streamLines.push('/F2 20 Tf');
      if (user.commitmentAverage >= 70) {
        streamLines.push('0.0 0.42 0.29 rg'); // Emerald Success Green
      } else {
        streamLines.push('0.73 0.1 0.1 rg'); // Warning/Muted Red
      }
      streamLines.push('410 612 Td');
      streamLines.push(`(${user.commitmentAverage}%) Tj`);
      streamLines.push('ET');

      // 3. Section Title: Wildly Important Goals
      streamLines.push('BT');
      streamLines.push('/F2 13 Tf');
      streamLines.push('0.035 0.078 0.149 rg');
      streamLines.push('40 555 Td');
      streamLines.push(`(${escapePdfText("Wildly Important Goals (WIGs)")}) Tj`);
      streamLines.push('ET');

      // Divider line
      streamLines.push('0.77 0.78 0.80 RG');
      streamLines.push('40 545 m 572 545 l S');

      // WIG Cards Data
      const wigData = [
        {
          type: 'REVENUE',
          title: 'WIG #1: Revenue Target',
          subtitle: 'Lag measure target of 25 Lakhs with lead and pipeline conversion.',
          current: `INR ${user.metrics.revenue.current.toLocaleString('en-IN')}`,
          target: `INR ${user.metrics.revenue.target.toLocaleString('en-IN')}`,
          progress: user.metrics.revenue.progress,
        },
        {
          type: 'PIPELINE',
          title: 'WIG #2: 3x Pipeline Target',
          subtitle: 'Build qualified pipeline target coverage of 75 Lakhs.',
          current: `INR ${user.metrics.pipeline.current.toLocaleString('en-IN')}`,
          target: `INR ${user.metrics.pipeline.target.toLocaleString('en-IN')}`,
          progress: user.metrics.pipeline.progress,
        },
        {
          type: 'SEATS',
          title: 'WIG #3: Seat Confirmed Target',
          subtitle: 'Fulfill class cohort seats requirements with 125 seat target.',
          current: `${user.metrics.seats.current} seats`,
          target: `${user.metrics.seats.target} seats`,
          progress: user.metrics.seats.progress,
        }
      ];

      // Draw each WIG card dynamically
      wigData.forEach((wig, index) => {
        const yStart = 390 - index * 145;

        // Draw Card border and background
        streamLines.push('0.85 0.86 0.90 RG');
        streamLines.push('0.98 0.98 1.0 rg');
        streamLines.push(`40 ${yStart} 532 135 re B`);

        // WIG Type Tag
        streamLines.push('BT');
        streamLines.push('/F3 8 Tf'); // Courier font for tag
        streamLines.push('0.45 0.45 0.5 rg');
        streamLines.push(`55 ${yStart + 115} Td`);
        streamLines.push(`(${wig.type}) Tj`);
        streamLines.push('ET');

        // WIG Title
        streamLines.push('BT');
        streamLines.push('/F2 12 Tf'); // Bold Title
        streamLines.push('0.035 0.078 0.149 rg');
        streamLines.push(`55 ${yStart + 98} Td`);
        streamLines.push(`(${escapePdfText(wig.title)}) Tj`);
        streamLines.push('ET');

        // WIG Subtitle
        streamLines.push('BT');
        streamLines.push('/F1 9 Tf');
        streamLines.push('0.4 0.4 0.45 rg');
        streamLines.push(`55 ${yStart + 83} Td`);
        streamLines.push(`(${escapePdfText(wig.subtitle)}) Tj`);
        streamLines.push('ET');

        // Values
        streamLines.push('BT');
        streamLines.push('/F1 10 Tf');
        streamLines.push('0.2 0.2 0.2 rg');
        streamLines.push(`55 ${yStart + 58} Td`);
        streamLines.push(`(Current:  ${escapePdfText(wig.current)}) Tj`);
        streamLines.push('ET');

        streamLines.push('BT');
        streamLines.push('/F1 10 Tf');
        streamLines.push('0.2 0.2 0.2 rg');
        streamLines.push(`260 ${yStart + 58} Td`);
        streamLines.push(`(Target:  ${escapePdfText(wig.target)}) Tj`);
        streamLines.push('ET');

        // Progress Text
        streamLines.push('BT');
        streamLines.push('/F2 11 Tf');
        if (wig.progress >= 70) {
          streamLines.push('0.0 0.42 0.29 rg'); // Success Green
        } else {
          streamLines.push('0.035 0.078 0.149 rg'); // Primary Blue
        }
        streamLines.push(`505 ${yStart + 58} Td`);
        streamLines.push(`(${wig.progress}%) Tj`);
        streamLines.push('ET');

        // Progress Bar Track
        streamLines.push('0.91 0.92 0.94 rg');
        streamLines.push(`55 ${yStart + 35} 462 10 re f`);

        // Filled Progress Bar Indicator
        if (wig.progress > 0) {
          const fillWidth = 462 * (Math.min(wig.progress, 100) / 100);
          if (wig.progress >= 70) {
            streamLines.push('0.06 0.72 0.50 rg'); // Emerald Success
          } else {
            streamLines.push('0.12 0.25 0.49 rg'); // Active Slate Blue
          }
          streamLines.push(`55 ${yStart + 35} ${fillWidth.toFixed(1)} 10 re f`);
        }
      });

      // 4. Footer
      streamLines.push('0.85 0.86 0.90 RG');
      streamLines.push('40 50 m 572 50 l S');

      // Date Footer
      streamLines.push('BT');
      streamLines.push('/F1 8 Tf');
      streamLines.push('0.5 0.5 0.5 rg');
      streamLines.push('40 35 Td');
      streamLines.push(`(Generated on: ${escapePdfText(timestamp)}) Tj`);
      streamLines.push('ET');

      // Brand Footer
      streamLines.push('BT');
      streamLines.push('/F2 8 Tf');
      streamLines.push('0.4 0.4 0.45 rg');
      streamLines.push('425 35 Td');
      streamLines.push(`(4DX Performance System) Tj`);
      streamLines.push('ET');

      // Compile stream content and construct PDF catalog structure
      const streamContent = streamLines.join('\n');
      const streamLength = streamContent.length;
      const streamObjectData = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`;

      const objects: string[] = [];
      const offsets: number[] = [];
      let currentOffset = 9; // Size of "%PDF-1.4\n"

      const addObj = (data: string) => {
        const id = objects.length + 1;
        offsets.push(currentOffset);
        const str = `${id} 0 obj\n${data}\nendobj`;
        objects.push(str);
        currentOffset += str.length + 1; // +1 for trailing newline
        return id;
      };

      // Output objects sequentially
      addObj(`<< /Type /Catalog /Pages 2 0 R >>`); // Obj 1: Catalog
      addObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`); // Obj 2: Pages list
      addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>`); // Obj 3: Page Definition
      addObj(streamObjectData); // Obj 4: Content Stream
      addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`); // Obj 5: Helvetica Font
      addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`); // Obj 6: Helvetica Bold Font
      addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`); // Obj 7: Monospace Font

      // Generate Xref table with exact offsets
      let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      offsets.forEach(offset => {
        xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
      });

      const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF`;
      const finalPdf = `%PDF-1.4\n${objects.join('\n')}\n${xref}${trailer}`;

      blob = new Blob([finalPdf], { type: 'application/pdf' });
    }

    // Trigger the download using a temporary anchor element
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleStartExport = () => {
    setExporting(true);
    setProgress(0);
    setIsFinished(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (exporting && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 15) + 5;
          if (next >= 100) {
            clearInterval(interval);
            setIsFinished(true);
            setExporting(false);
            triggerDownload(selectedFormat);
            return 100;
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [exporting, progress, selectedFormat]);

  // Support ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-body-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/45 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-surface-container-lowest border border-outline-variant/40 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-headline-md text-[18px] font-bold text-on-surface">
                Export Dashboard Data
              </h3>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!exporting && !isFinished ? (
                <div className="space-y-5">
                  <p className="text-on-surface-variant text-body-sm leading-relaxed">
                    Select your preferred file format below to generate and download the Sales Performance reports.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'csv', label: 'CSV File', ext: '.csv', desc: 'Raw spreadsheet data', icon: 'table_view' },
                      { key: 'pdf', label: 'PDF Report', ext: '.txt', desc: 'Print-ready document', icon: 'picture_as_pdf' },
                      { key: 'xlsx', label: 'Excel Sheet', ext: '.xlsx', desc: 'Formatted analysis', icon: 'view_list' },
                    ].map((fmt) => {
                      const isSelected = selectedFormat === fmt.key;
                      return (
                        <div
                          key={fmt.key}
                          onClick={() => setSelectedFormat(fmt.key as any)}
                          className={`p-4 border rounded-xl cursor-pointer flex flex-col items-center text-center transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary text-primary'
                              : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/70'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px] mb-2">{fmt.icon}</span>
                          <span className="font-bold text-body-sm">{fmt.label}</span>
                          <span className="text-[10px] opacity-70 mt-0.5">{fmt.ext}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-outline-variant/60 rounded-lg text-on-surface font-semibold hover:bg-surface-container-low transition-colors text-body-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartExport}
                      className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors text-body-sm shadow-sm"
                    >
                      Start Export
                    </button>
                  </div>
                </div>
              ) : exporting ? (
                <div className="flex flex-col items-center py-6">
                  <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-4">
                    autorenew
                  </span>
                  <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                    Generating File...
                  </h4>
                  <p className="text-on-surface-variant text-body-sm mb-5">
                    Formatting data for {selectedFormat.toUpperCase()} download
                  </p>

                  <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary mt-2 font-mono">
                    {progress}% Complete
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4 ring-2 ring-secondary/20"
                  >
                    <span className="material-symbols-outlined text-[36px] font-bold">check</span>
                  </motion.div>
                  <h4 className="font-headline-md text-[20px] font-bold text-on-surface mb-2">
                    Export Ready!
                  </h4>
                  <p className="text-on-surface-variant text-body-sm mb-6 max-w-xs">
                    Your {selectedFormat.toUpperCase()} file has been generated and downloaded successfully.
                  </p>

                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-body-sm shadow-sm"
                  >
                    Finish
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
