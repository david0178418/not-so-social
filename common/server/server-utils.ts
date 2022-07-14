import { unique } from '@common/utils';
import {
	ExtendedWhitespaceRegex,
	PunctuationRegex,
	StopWords,
} from '@common/constants';

export
// Adapted from https://danielcorcoranssql.wordpress.com/2020/07/06/fuzzy-search-with-mongodb-n-grams/
function grammit(rawText: string, gramSizeLimit = 3): string {
	const spl = cleanPunctuation(rawText.toLocaleLowerCase())
		.split(' ')
		.filter(isNotStopWord)
		.flatMap(word => word.split(''));

	if(spl.length < 3) {
		return spl.join('');
	}

	const grams: string[] = [];

	spl.forEach((c, i) => {
		if(i < spl.length - (gramSizeLimit - 1)) {
			grams.push(
				spl
					.slice(i, i + gramSizeLimit)
					.join('')
			);
		}
	});

	return unique(grams).join(' ');
}

function cleanPunctuation(str: string) {
	return str
		.replace(PunctuationRegex, '')
		.replace(ExtendedWhitespaceRegex, '');
}

function isNotStopWord(word: string): boolean {
	return !StopWords.includes(word);
}
