const toInt = (val) => {
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? null : n;
  };
  
  // convert string/number → FLOAT or null
  const toFloat = (val) => {
    const n = parseFloat(val);
    return Number.isNaN(n) ? null : n;
  };
  
  // quick UUID v4 format test
  const isUuid = (id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id ?? ''
    );
    export {isUuid,toInt,toFloat}