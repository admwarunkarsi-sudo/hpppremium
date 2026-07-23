import { logger } from '../../../core/logger.js';
import { DateUtils } from '../../../shared/utils/date.js';

export const ExportService = {
    exportJSON(results, recipeName) {
        try {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `HPP_${recipeName.replace(/\s+/g, '_')}_${DateUtils.now().replace(/:/g,'-')}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            logger.audit(`Exported JSON for ${recipeName}`);
        } catch(e) {
            logger.error('Failed to export JSON', e);
        }
    },

    exportCSV(results, recipeName) {
        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Item,Formula,Result (Rp)\n";
            results.logs.forEach(log => {
                const formula = log.formula.replace(/"/g, '""');
                csvContent += `"${log.item}","${formula}","${log.result}"\n`;
            });
            csvContent += `"TOTAL HPP","","${results.grandTotal}"\n`;
            csvContent += `"HPP PER PORSI","","${results.hppPerPortion}"\n`;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `HPP_${recipeName.replace(/\s+/g, '_')}_${DateUtils.now().replace(/:/g,'-')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            logger.audit(`Exported CSV for ${recipeName}`);
        } catch(e) {
            logger.error('Failed to export CSV', e);
        }
    }
};
