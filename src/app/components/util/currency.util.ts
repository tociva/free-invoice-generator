export class CurrencyUtil {
    static numberToWords(
      amount: number,
      shortName: string,
      fraction: string,
      decimalPlaces = 2,
      internationalNumbering = false
    ): string {
      const ones = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
        'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
      ];
  
      const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy',
        'Eighty', 'Ninety',
      ];
  
      const indianUnits = ['', 'Thousand', 'Lakh', 'Crore'];
      const intlUnits = ['', 'Thousand', 'Million', 'Billion'];
  
      const convertBelowThousand = (n: number): string => {
        let word = '';
        if (n >= 100) {
          word += `${ones[Math.floor(n / 100)] } Hundred `;
          n %= 100;
        }
        if (n >= 20) {
          word += `${tens[Math.floor(n / 10)] } `;
          n %= 10;
        }
        if (n > 0) {
          word += `${ones[n] } `;
        }
        return word.trim();
      };
  
      const convertIndian = (n: number): string => {
        const parts: string[] = [];
        const nums = [
          n % 1000, // units
          Math.floor(n / 1000) % 100, // thousand
          Math.floor(n / 100000) % 100, // lakh
          Math.floor(n / 10000000), // crore
        ];
  
        for (let i = nums.length - 1; i >= 0; i--) {
          if (nums[i]) {
            parts.push(convertBelowThousand(nums[i]) + (indianUnits[i] ? ` ${ indianUnits[i]}` : ''));
          }
        }
  
        return parts.join(' ').trim();
      };
  
      const convertInternational = (n: number): string => {
        const parts: string[] = [];
        let unitIndex = 0;
  
        while (n > 0 && unitIndex < intlUnits.length) {
          const chunk = n % 1000;
          if (chunk > 0) {
            parts.unshift(convertBelowThousand(chunk) + (intlUnits[unitIndex] ? ` ${ intlUnits[unitIndex]}` : ''));
          }
          n = Math.floor(n / 1000);
          unitIndex++;
        }
  
        return parts.join(' ').trim();
      };
  
      const wholePart = Math.floor(amount);
      const decimalPart = Math.round((amount - wholePart) * Math.pow(10, decimalPlaces));
  
      const mainWords = internationalNumbering
        ? convertInternational(wholePart)
        : convertIndian(wholePart);
  
      const paisaWords = decimalPart
        ? `and ${convertBelowThousand(decimalPart)} ${fraction}`
        : '';
  
      return `${shortName} ${mainWords} ${paisaWords}`.trim();
    }
  }
  