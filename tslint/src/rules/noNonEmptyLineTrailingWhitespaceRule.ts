import * as ts from "typescript";
import * as Lint from "tslint/lib/lint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "non-empty line trailing whitespace";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoNonEmptyLineTrailingWhitespaceWalker(sourceFile, this.getOptions()));
    }
}

class NoNonEmptyLineTrailingWhitespaceWalker extends Lint.SkippableTokenAwareRuleWalker {
    public visitSourceFile(node: ts.SourceFile) {
        super.visitSourceFile(node);
        let lastSeenWasWhitespace = false;
        let lastSeenWhitespacePosition = 0;
        let hasNonWhitespace = false;
        Lint.scanAllTokens(ts.createScanner(ts.ScriptTarget.ES5, false, ts.LanguageVariant.Standard, node.text), (scanner: ts.Scanner) => {
            const startPos = scanner.getStartPos();
            if (this.tokensToSkipStartEndMap[startPos] != null) {
                // tokens to skip are places where the scanner gets confused about what the token is, without the proper context
                // (specifically, regex, identifiers, and templates). So skip those tokens.
                scanner.setTextPos(this.tokensToSkipStartEndMap[startPos]);
                lastSeenWasWhitespace = false;
                return;
            }

            if (scanner.getToken() === ts.SyntaxKind.NewLineTrivia) {
                if (lastSeenWasWhitespace && hasNonWhitespace) {
                    const width = scanner.getStartPos() - lastSeenWhitespacePosition;
                    const failure = this.createFailure(lastSeenWhitespacePosition, width, Rule.FAILURE_STRING);
                    this.addFailure(failure);
                }
                lastSeenWasWhitespace = false;
                hasNonWhitespace = false;
            } else if (scanner.getToken() === ts.SyntaxKind.WhitespaceTrivia) {
                lastSeenWasWhitespace = true;
                lastSeenWhitespacePosition = scanner.getStartPos();
            } else {
                lastSeenWasWhitespace = false;
                hasNonWhitespace = true;
            }
        });
    }
}
