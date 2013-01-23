%{!?python_sitelib: %global python_sitelib %(%{__python} -c "from distutils.sysconfig import get_python_lib; print get_python_lib()")}
%{!?pyver: %global pyver %(%{__python} -c "import sys ; print sys.version[:3]")}

%define   oname longerusername

Name:           django-%{oname}
Version:        0.4
Release:        1%{?dist}
Summary:        Longer django username

Group:          Development/Libraries
License:        BSD
URL:		http://pypi.python.org/pypi/longerusername
Source0:        http://pypi.python.org/packages/source/l/longerusername/%{oname}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  python-devel
BuildRequires:  python-setuptools
Requires: 	Django-south

%description
A Django South migration step to change username size

%prep
%setup -q -n %{oname}-%{version}
sed -i "s|\r||g" PKG-INFO


%build
CFLAGS="$RPM_OPT_FLAGS" %{__python} setup.py build


%install
%{__python} setup.py install --skip-build --root="$RPM_BUILD_ROOT"


%files
%doc PKG-INFO
%{python_sitelib}/%{oname}/
%{python_sitelib}/%{oname}-%{version}-py%{pyver}*.egg-info


%changelog
* Wed Jan 23 2013 Antonio Perez-Aranda <aperezaranda@yaco.es> - 0.4-1
- Initial RPM release
