# SPARC galaxy rotation curves, fetch instructions

## Source

> Lelli, F., McGaugh, S. S., Schombert, J. M. (2016). *SPARC: Mass
> Models for 175 Disk Galaxies with Spitzer Photometry and Accurate
> Rotation Curves*. AJ 152, 157.
> [doi:10.3847/0004-6256/152/6/157](https://doi.org/10.3847/0004-6256/152/6/157)

Public data: http://astroweb.cwru.edu/SPARC/

Pick 3-4 galaxies spanning dwarf to giant masses (suggested: DDO 154,
NGC 3198, NGC 2403, UGC 2885) and re-emit with our schema:

```
name,r_kpc,v_kms,sigma_kms,v_baryonic_kms
```

The SPARC tables provide `Rad` (kpc), `Vobs` (km/s), `errV` (km/s), and
the baryonic component already decomposed; copy them and re-name.
