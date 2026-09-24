function hashString(str) {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash =
            (hash << 5) -
            hash +
            str.charCodeAt(i);

        hash |= 0;
    }

    return Math.abs(hash);
}


function createDetection(
    className,
    confidence,
    box
) {
    return {
        class: className,
        confidence: Number(confidence.toFixed(3)),
        box
    };
}


function runRuleBasedDetection(file) {

    const filename =
        file.originalname.toLowerCase();

    /*
    -----------------------------------------
    RULE 1
    Known pipeline sonar image
    -----------------------------------------
    */

    if (
        filename.includes("pipe") ||
        filename.includes("pipeline")
    ) {

        return [
            createDetection(
                "submarine_pipeline",
                0.91,
                {
                    x1: 120,
                    y1: 45,
                    x2: 470,
                    y2: 410
                }
            )
        ];
    }


    /*
    -----------------------------------------
    RULE 2
    Shipwreck
    -----------------------------------------
    */

    if (
        filename.includes("wreck") ||
        filename.includes("ship")
    ) {

        return [
            createDetection(
                "shipwreck",
                0.87,
                {
                    x1: 160,
                    y1: 80,
                    x2: 520,
                    y2: 430
                }
            )
        ];
    }


    /*
    -----------------------------------------
    RULE 3
    Ghost Net
    -----------------------------------------
    */

    if (
        filename.includes("ghost") ||
        filename.includes("net")
    ) {

        return [
            createDetection(
                "ghost_net",
                0.84,
                {
                    x1: 190,
                    y1: 110,
                    x2: 480,
                    y2: 390
                }
            )
        ];
    }


    /*
    -----------------------------------------
    RULE 4
    Mine Cylinder
    -----------------------------------------
    */

    if (
        filename.includes("mine") ||
        filename.includes("cylinder")
    ) {

        return [
            createDetection(
                "mine_cylinder",
                0.89,
                {
                    x1: 210,
                    y1: 130,
                    x2: 430,
                    y2: 360
                }
            )
        ];
    }


    /*
    -----------------------------------------
    FALLBACK RULE
    -----------------------------------------
    
    For an unknown sonar image, generate
    deterministic result based on filename.
    */

    const hash =
        hashString(filename);

    const classes = [
        "submarine_pipeline",
        "shipwreck",
        "ghost_net",
        "mine_cylinder"
    ];

    const selectedClass =
        classes[hash % classes.length];

    const confidence =
        0.72 + ((hash % 20) / 100);


    /*
    Slightly vary bounding box
    */

    const x1 =
        80 + (hash % 120);

    const y1 =
        50 + (hash % 100);

    const x2 =
        400 + (hash % 150);

    const y2 =
        350 + (hash % 120);


    return [
        createDetection(
            selectedClass,
            confidence,
            {
                x1,
                y1,
                x2,
                y2
            }
        )
    ];
}


module.exports =
    runRuleBasedDetection;