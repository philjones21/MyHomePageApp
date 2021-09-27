/*
* SanitationUtil used to clean up user input to remove special characters
* used by database.
*/
export class SanitationUtil {

    private blackListMap = new Map();

    constructor(blackList: string[]) {
        for (let i: number = 0; i < blackList.length; i++) {
            this.blackListMap.set(blackList[i], blackList[i]);
        }
    }

    public sanitizeWithBlackList(target: string): string {
        let cleanString: string = "";

        for (let i: number = 0; i < target.length; i++) {
            if (!this.blackListMap.has(target.charAt(i))) {
                cleanString += target.charAt(i);
            }
        }
        return cleanString;
    }

    public sanitizeObjectWithBlackList(targetObj: any): void {
        Object.entries(targetObj).forEach(([key, value]) => {
            if (typeof value === 'string') {
                let cleanString: string = "";
                for (let i: number = 0; i < value.length; i++) {
                    if (!this.blackListMap.has(value.charAt(i))) {
                        cleanString += value.charAt(i);
                    }
                }
                targetObj[key] = cleanString;
            }
        })
    }

    public objectHasNoBlackListedCharacters(targetObj: any): Promise<boolean> {
        return new Promise((inResolve, inReject) => {
            Object.entries(targetObj).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    for (let i: number = 0; i < value.length; i++) {
                        if (this.blackListMap.has(value.charAt(i))) {
                            inReject(false);
                            return;
                        }
                    }
                }
            });
            inResolve(true);
        });
    }

    public stringHasNoBlackListedCharacters(target: string): Promise<boolean> {
        return new Promise((inResolve, inReject) => {
            for (let i: number = 0; i < target.length; i++) {
                if (this.blackListMap.has(target.charAt(i))) {
                    inReject(false);
                    return;
                }
            }
            inResolve(true);
        });
    }
}